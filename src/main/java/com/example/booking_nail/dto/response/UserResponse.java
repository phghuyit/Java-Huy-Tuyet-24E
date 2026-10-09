package com.example.booking_nail.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
}
