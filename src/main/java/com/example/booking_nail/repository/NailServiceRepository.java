package com.example.booking_nail.repository;

import com.example.booking_nail.model.NailServices;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NailServiceRepository extends JpaRepository<NailServices
        ,Long> {

}
