package com.example.booking_nail.repository;

import com.example.booking_nail.entity.NailService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NailServiceRepository extends JpaRepository<NailService, Long> {
    boolean existsByCategoryId(Long categoryId);
    boolean existsByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
}
