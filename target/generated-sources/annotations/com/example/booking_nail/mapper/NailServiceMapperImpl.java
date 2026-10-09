package com.example.booking_nail.mapper;

import com.example.booking_nail.dto.request.NailServiceCreationRequest;
import com.example.booking_nail.dto.request.NailServiceUpdateRequest;
import com.example.booking_nail.dto.response.NailServiceResponse;
import com.example.booking_nail.entity.NailService;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-10-03T15:35:47+0700",
    comments = "version: 1.6.3, compiler: javac, environment: Java 26.0.1 (Oracle Corporation)"
)
@Component
public class NailServiceMapperImpl implements NailServiceMapper {

    @Override
    public NailService dtoToNailService(NailServiceCreationRequest request) {
        if ( request == null ) {
            return null;
        }

        NailService nailService = new NailService();

        nailService.setCategoryId( request.getCategoryId() );
        nailService.setName( request.getName() );
        nailService.setPrice( request.getPrice() );
        nailService.setDurationMinutes( request.getDurationMinutes() );
        nailService.setDescription( request.getDescription() );
        nailService.setImageUrl( request.getImageUrl() );
        nailService.setStatus( request.getStatus() );

        return nailService;
    }

    @Override
    public NailServiceResponse toResponse(NailService nailService) {
        if ( nailService == null ) {
            return null;
        }

        NailServiceResponse nailServiceResponse = new NailServiceResponse();

        nailServiceResponse.setId( nailService.getId() );
        nailServiceResponse.setCategoryId( nailService.getCategoryId() );
        nailServiceResponse.setName( nailService.getName() );
        nailServiceResponse.setPrice( nailService.getPrice() );
        nailServiceResponse.setDurationMinutes( nailService.getDurationMinutes() );
        nailServiceResponse.setDescription( nailService.getDescription() );
        nailServiceResponse.setImageUrl( nailService.getImageUrl() );
        nailServiceResponse.setStatus( nailService.getStatus() );

        return nailServiceResponse;
    }

    @Override
    public void updateNailService(NailServiceUpdateRequest request, NailService nailService) {
        if ( request == null ) {
            return;
        }

        nailService.setCategoryId( request.getCategoryId() );
        nailService.setName( request.getName() );
        nailService.setPrice( request.getPrice() );
        nailService.setDurationMinutes( request.getDurationMinutes() );
        nailService.setDescription( request.getDescription() );
        nailService.setImageUrl( request.getImageUrl() );
        nailService.setStatus( request.getStatus() );
    }
}
