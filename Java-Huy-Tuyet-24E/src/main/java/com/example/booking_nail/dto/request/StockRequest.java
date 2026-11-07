package com.example.booking_nail.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StockRequest {
    private Long productId;
    private String type;
    private Integer delta;
    private String note;
    private String operator;
}
