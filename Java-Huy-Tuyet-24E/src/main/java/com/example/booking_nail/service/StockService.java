package com.example.booking_nail.service;

import com.example.booking_nail.dto.request.StockRequest;
import com.example.booking_nail.dto.response.StockResponse;
import com.example.booking_nail.entity.Product;
import com.example.booking_nail.entity.Stock;
import com.example.booking_nail.repository.ProductRepository;
import com.example.booking_nail.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StockService {
    private static final Set<String> VALID_STOCK_TYPES = Set.of("IN", "OUT", "ADJUST");

    private final StockRepository stockRepository;
    private final ProductRepository productRepository;

    public List<StockResponse> getAll(Long productId) {
        List<Stock> list = productId != null
                ? stockRepository.findByProductIdOrderByCreatedAtDesc(productId)
                : stockRepository.findAllByOrderByCreatedAtDesc();
        return list.stream().map(StockResponse::from).toList();
    }

    @Transactional
    public StockResponse create(StockRequest request) {
        if (request == null || request.getProductId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thiếu ID sản phẩm");
        }
        if (request.getDelta() == null || request.getDelta() == 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Số lượng biến động kho (delta) phải khác 0");
        }

        String rawType = request.getType() != null && !request.getType().isBlank()
                ? request.getType().strip().toUpperCase(Locale.ROOT)
                : "ADJUST";

        String type;
        if ("IMPORT".equals(rawType) || "IN".equals(rawType)) {
            type = "IN";
        } else if ("EXPORT".equals(rawType) || "OUT".equals(rawType)) {
            type = "OUT";
        } else if ("ADJUST".equals(rawType)) {
            type = "ADJUST";
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Loại giao dịch kho không hợp lệ (chỉ chấp nhận IN, OUT, ADJUST)");
        }

        int delta = request.getDelta();
        if ("OUT".equals(type) && delta > 0) {
            delta = -delta;
        } else if ("IN".equals(type) && delta < 0) {
            delta = Math.abs(delta);
        }

        Product product = productRepository.findByIdForUpdate(request.getProductId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm ID: " + request.getProductId()));

        int before = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
        int after = before + delta;

        if (after < 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Số lượng xuất vượt quá tồn kho hiện tại (tồn kho: " + before + ", yêu cầu xuất: " + Math.abs(delta) + ")");
        }

        product.setStockQuantity(after);
        productRepository.save(product);

        Stock stock = new Stock();
        stock.setProductId(product.getId());
        stock.setProductName(product.getName());
        stock.setSku(product.getSku());
        stock.setType(type);
        stock.setDelta(delta);
        stock.setBeforeQty(before);
        stock.setAfterQty(after);
        stock.setNote(request.getNote() != null ? request.getNote() : "");
        stock.setOperator(request.getOperator() != null && !request.getOperator().isBlank()
                ? request.getOperator()
                : "Quản trị viên VELA");

        return StockResponse.from(stockRepository.save(stock));
    }
}
