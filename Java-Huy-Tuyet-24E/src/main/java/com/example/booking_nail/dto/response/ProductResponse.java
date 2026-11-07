package com.example.booking_nail.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private Long id;
    private Long categoryId;
    private String sku;
    private String name;
    private String unit;
    private BigDecimal costPrice;
    private BigDecimal salePrice;
    private Integer stockQuantity;
    private Integer minStock;
    private Boolean isForSale;
    private String status;
    private String imageUrl;
}
