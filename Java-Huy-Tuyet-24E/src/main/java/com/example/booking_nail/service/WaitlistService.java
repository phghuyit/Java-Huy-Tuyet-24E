package com.example.booking_nail.service;

import com.example.booking_nail.dto.request.WaitlistRequest;
import com.example.booking_nail.dto.response.WaitlistResponse;
import com.example.booking_nail.entity.WaitlistEntry;
import com.example.booking_nail.mapper.WaitlistMapper;
import com.example.booking_nail.repository.WaitlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WaitlistService {

    private final WaitlistRepository waitlistRepository;
    private final WaitlistMapper waitlistMapper;

    public List<WaitlistResponse> getAll(String status, LocalDate date, Long customerId) {
        List<WaitlistEntry> list;
        if (status != null && !status.isBlank()) {
            list = waitlistRepository.findByStatus(status.trim().toUpperCase());
        } else if (date != null) {
            list = waitlistRepository.findByDesiredDate(date);
        } else if (customerId != null) {
            list = waitlistRepository.findByCustomerId(customerId);
        } else {
            list = waitlistRepository.findAll();
        }
        return list.stream().map(waitlistMapper::toResponse).toList();
    }

    public WaitlistResponse getById(Long id) {
        WaitlistEntry entry = waitlistRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hàng chờ ID: " + id));
        return waitlistMapper.toResponse(entry);
    }

    @Transactional
    public WaitlistResponse create(WaitlistRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tên khách hàng không được để trống");
        }
        if (request.getPhone() == null || request.getPhone().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Số điện thoại không được để trống");
        }
        WaitlistEntry entry = waitlistMapper.toEntity(request);
        return waitlistMapper.toResponse(waitlistRepository.save(entry));
    }

    @Transactional
    public WaitlistResponse update(Long id, WaitlistRequest request) {
        WaitlistEntry entry = waitlistRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hàng chờ ID: " + id));
        waitlistMapper.updateEntity(request, entry);
        return waitlistMapper.toResponse(waitlistRepository.save(entry));
    }

    @Transactional
    public void delete(Long id) {
        if (!waitlistRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hàng chờ ID: " + id);
        }
        waitlistRepository.deleteById(id);
    }
}
