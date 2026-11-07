package com.example.booking_nail.repository;

import com.example.booking_nail.entity.Stock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockRepository extends JpaRepository<Stock, Long> {
    List<Stock> findAllByOrderByCreatedAtDesc();
    List<Stock> findByProductIdOrderByCreatedAtDesc(Long productId);
}
