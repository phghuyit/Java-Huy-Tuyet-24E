package com.example.booking_nail.dto.response;

import com.example.booking_nail.entity.User;

public record AuthResponse(Long id, String name, String email, Long roleId, String roleCode, String roleName) {
    public static AuthResponse from(User user) {
        return new AuthResponse(user.getId(), user.getFullName(), user.getEmail(),
                user.getRole().getId(), user.getRole().getCode(), user.getRole().getName());
    }
}
