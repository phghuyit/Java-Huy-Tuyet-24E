package com.example.booking_nail.repository;

import com.example.booking_nail.entity.LookbookEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LookbookRepository extends JpaRepository<LookbookEntry, Long> {
    List<LookbookEntry> findByCategorySlug(String categorySlug);
    List<LookbookEntry> findByStaffId(Long staffId);
    List<LookbookEntry> findByServiceId(Long serviceId);
}
