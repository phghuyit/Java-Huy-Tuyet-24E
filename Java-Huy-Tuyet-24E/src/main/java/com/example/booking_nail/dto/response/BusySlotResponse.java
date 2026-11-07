package com.example.booking_nail.dto.response;

import java.time.LocalDate;
import java.time.LocalTime;

public record BusySlotResponse(Long id, Long staffId, LocalDate appointmentDate, LocalTime timeStart, LocalTime timeEnd) {
}
