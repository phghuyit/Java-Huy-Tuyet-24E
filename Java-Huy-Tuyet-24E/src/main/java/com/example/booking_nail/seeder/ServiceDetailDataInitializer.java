package com.example.booking_nail.seeder;

import com.example.booking_nail.entity.AppointmentServices;
import com.example.booking_nail.entity.Appointments;
import com.example.booking_nail.entity.NailService;
import com.example.booking_nail.repository.AppointmentServicesRepository;
import com.example.booking_nail.repository.AppointmentsRepository;
import com.example.booking_nail.repository.NailServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Component
@Order(6)
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.seed-data.enabled", havingValue = "true")
public class ServiceDetailDataInitializer implements CommandLineRunner {

    private final AppointmentsRepository appointmentsRepository;
    private final AppointmentServicesRepository appointmentServicesRepository;
    private final NailServiceRepository nailServiceRepository;

    @Override
    @Transactional
    public void run(String... args) {
        List<Appointments> appointments = appointmentsRepository.findAll();
        if (appointments.isEmpty()) {
            return;
        }

        List<NailService> services = nailServiceRepository.findAll();
        if (services.isEmpty()) {
            return;
        }

        for (Appointments appt : appointments) {
            List<AppointmentServices> existingDetails = appointmentServicesRepository.findByAppointmentId(appt.getId());

            if (existingDetails.isEmpty()) {
                seedDetailsForAppointment(appt, services);
            }
        }
    }

    private void seedDetailsForAppointment(Appointments appt, List<NailService> services) {
        NailService primaryService = findServiceByName(services, "Sơn gel", services.get(0));
        NailService secondaryService = findServiceByName(services, "Chăm sóc móng tay", services.size() > 1 ? services.get(1) : primaryService);

        saveServiceDetail(appt.getId(), primaryService);

        if (!secondaryService.getId().equals(primaryService.getId())) {
            saveServiceDetail(appt.getId(), secondaryService);
        }
    }

    private void saveServiceDetail(Long appointmentId, NailService service) {
        BigDecimal price = service.getPrice() != null ? BigDecimal.valueOf(service.getPrice()) : BigDecimal.ZERO;
        AppointmentServices detail = new AppointmentServices(null, appointmentId, service.getId(), price);
        appointmentServicesRepository.save(detail);
    }

    private NailService findServiceByName(List<NailService> services, String name, NailService fallback) {
        return services.stream()
                .filter(s -> s.getName() != null && s.getName().equalsIgnoreCase(name))
                .findFirst()
                .orElse(fallback);
    }
}
