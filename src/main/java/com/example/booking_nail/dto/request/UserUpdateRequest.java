package com.example.booking_nail.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserUpdateRequest {
    private String fullName;
    private String email;
    private String phone;
}
