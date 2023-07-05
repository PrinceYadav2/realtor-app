import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { HomeService } from './home.service';
import { HomeResponseDto, UpdateHomeDto, createHomeDto } from './dto/home.dto';
import { PropertyType } from '@prisma/client';

@Controller('home')
export class HomeController {
    constructor(private readonly homeService: HomeService) {

    }

    @Get()
    getHomes(
        @Query('city') city? : string,
        @Query('minPrice') minPrice? : string,
        @Query('maxPrice') maxPrice? : string,
        @Query('propertyType') propertyType? : PropertyType
    ) : Promise<HomeResponseDto[]> {
        const price = minPrice || maxPrice ? {
            ...(minPrice && { gte : parseFloat(minPrice)}),
            ...(maxPrice && { lte: parseFloat(maxPrice)})
        } : null;
        const filters = {
            ...(city && {city}),
            ...(price && {price}),
            ...(propertyType && {propertyType})
        };
        return this.homeService.getHomes(filters);
    }

    @Get(':id')
    getHome(@Param('id', ParseIntPipe) id: number): Promise<HomeResponseDto> {
        return this.homeService.getHomeById(id);
    }

    @Post()
    createHome(
        @Body() body : createHomeDto
    ) {
        return this.homeService.createHome(body);
    }

    @Put(':id')
    updateHome(
        @Param('id', ParseIntPipe) id : number,
        @Body() body : UpdateHomeDto
    ) {
        return this.homeService.updateHomeByID(id, body);
    }

    @Delete(':id')
    deleteHome(
        @Param('id', ParseIntPipe) id : number
    )  {
        this.homeService.deleteHomeById(id);
    }


}
