package com.example.booking_nail.repository;

import com.example.booking_nail.entity.Appointments;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentsRepository extends JpaRepository<Appointments, Long> {
    boolean existsByBookingCode(String bookingCode);
    Optional<Appointments> findByBookingCode(String bookingCode);

    List<Appointments> findByCustomerIdOrderByAppointmentDateDescTimeStartDesc(Long customerId);

    @Query("SELECT COUNT(a) > 0 FROM Appointments a " +
           "WHERE a.staffId = :staffId " +
           "AND a.appointmentDate = :date " +
           "AND a.status NOT IN ('CANCELLED', 'NO_SHOW') " +
           "AND a.timeStart < :timeEnd " +
           "AND a.timeEnd > :timeStart " +
           "AND (:excludeId IS NULL OR a.id <> :excludeId)")
    boolean existsOverlap(@Param("staffId") Long staffId,
                          @Param("date") LocalDate date,
                          @Param("timeStart") LocalTime timeStart,
                          @Param("timeEnd") LocalTime timeEnd,
                          @Param("excludeId") Long excludeId);

    @Query("SELECT a FROM Appointments a " +
           "WHERE a.appointmentDate = :date " +
           "AND a.status NOT IN ('CANCELLED', 'NO_SHOW') " +
           "AND (:staffId IS NULL OR a.staffId = :staffId)")
    List<Appointments> findBusySlots(@Param("date") LocalDate date,
                                     @Param("staffId") Long staffId);
}
