package com.example.booking_nail.controller;


import com.example.booking_nail.dto.request.UserCreationRequest;
import com.example.booking_nail.dto.request.UserUpdateRequest;
import com.example.booking_nail.dto.response.UserResponse;
import com.example.booking_nail.entity.User;
import com.example.booking_nail.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse createUser(@RequestBody UserCreationRequest request) {
        User savedUser = userService.createUser(request);

        UserResponse response = new UserResponse();
        response.setId(savedUser.getId());
        response.setFullName(savedUser.getFullName());
        response.setPhone(savedUser.getPhone());
        response.setEmail(savedUser.getEmail());

        return response;
    }

    @GetMapping
    public List<UserResponse> getAllUser() {
        List<User> users = userService.getUsers();

        List<UserResponse> responses = new ArrayList<>();

        for (User user : users) {
            UserResponse response = new UserResponse();

            response.setId(user.getId());
            response.setFullName(user.getFullName());
            response.setPhone(user.getPhone());
            response.setEmail(user.getEmail());

            responses.add(response);
        }
        return responses;
    }


    @GetMapping("/{id}")
    public UserResponse getUser(@PathVariable Long id) {
        User user = userService.getUser(id);

        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setFullName(user.getFullName());
        response.setPhone(user.getPhone());
        response.setEmail(user.getEmail());

        return response;
    }


    @PutMapping("/{id}")
    public UserResponse updateUser(@PathVariable Long id,
                                   @RequestBody UserUpdateRequest request) {
        User savedUser = userService.updateUser(id, request);

        UserResponse response = new UserResponse();
        response.setId(savedUser.getId());
        response.setFullName(savedUser.getFullName());
        response.setPhone(savedUser.getPhone());
        response.setEmail(savedUser.getEmail());

        return response;
    }


    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }
}
