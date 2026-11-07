package com.example.booking_nail.dto.response;

import com.example.booking_nail.entity.Stock;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StockResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String sku;
    private String type;
    private Integer delta;
    private Integer beforeQty;
    private Integer afterQty;
    private String note;
    private String operator;
    private LocalDateTime createdAt;

    public static StockResponse from(Stock stock) {
        return new StockResponse(
                stock.getId(),
                stock.getProductId(),
                stock.getProductName(),
                stock.getSku(),
                stock.getType(),
                stock.getDelta(),
                stock.getBeforeQty(),
                stock.getAfterQty(),
                stock.getNote(),
                stock.getOperator(),
                stock.getCreatedAt()
        );
    }
}
