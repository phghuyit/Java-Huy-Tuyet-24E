package com.example.booking_nail.dto.response;

import lombok.Getter;
import lombok.Setter;
import com.example.booking_nail.entity.User;
import java.time.LocalDateTime;

@Getter
@Setter
public class UserResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private Long roleId;
    private String roleCode;
    private String roleName;
    private String status;
    private String avatarUrl;
    private boolean hasPassword;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static UserResponse from(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        if (user.getRole() != null) {
            response.setRoleId(user.getRole().getId());
            response.setRoleCode(user.getRole().getCode());
            response.setRoleName(user.getRole().getName());
        }
        response.setStatus(user.getStatus());
        response.setAvatarUrl(user.getAvatarUrl());
        response.setHasPassword(user.getPasswordHash() != null && !user.getPasswordHash().isBlank());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        return response;
    }
}
