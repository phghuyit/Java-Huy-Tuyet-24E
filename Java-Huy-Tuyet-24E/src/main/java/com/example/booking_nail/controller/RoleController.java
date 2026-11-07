package com.example.booking_nail.controller;

import com.example.booking_nail.entity.Role;
import com.example.booking_nail.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RoleController {
    private final RoleService roleService;

    @GetMapping
    public List<Role> getRoles() {
        return roleService.getRoles();
    }

    @GetMapping("/{id}")
    public Role getRole(@PathVariable Long id) {
        return roleService.getRole(id);
    }
}
