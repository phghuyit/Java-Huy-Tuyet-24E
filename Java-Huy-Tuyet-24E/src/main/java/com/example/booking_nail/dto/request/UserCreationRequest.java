package com.example.booking_nail.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserCreationRequest {
    private String fullName;
    private String email;
    private String phone;
    private Long roleId;
    private String password;
    private String status;
    private String avatarUrl;
    private String jobTitle;
    private String bio;
    private Integer experienceYears;

}
