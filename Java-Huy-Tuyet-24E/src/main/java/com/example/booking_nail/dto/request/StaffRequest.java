package com.example.booking_nail.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StaffRequest {
    private String name;
    private String fullName;
    private String email;
    private String phone;
    private String password;
    private String status;
    private String role;
    private String jobTitle;
    private String bio;
    private Integer experienceYears;
    private String avatarUrl;
}
