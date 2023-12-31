import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HomeResponseDto } from './dto/home.dto';
import { PropertyType } from '@prisma/client';

interface GetHomesParams {
    city? : string,
    price? : { 
        gte?: number,
        lte?: number},
    propertyType: PropertyType
}

interface CreateHomeParams {
    address: string;
    numberOfBedrooms: number;
    numberOfBathrooms: number;
    city: string;
    price: number;
    landSize: number;
    propertyType: PropertyType;
    images: {
        url: string
    }[];
}

interface UpdateHomeParams {
    address?: string;
    numberOfBedrooms?: number;
    numberOfBathrooms?: number;
    city?: string;
    price?: number;
    landSize?: number;
    propertyType?: PropertyType;
}

const homeSelect = {
    id: true,
    address: true,
    city: true,
    price: true,
    property_type: true,
    number_of_bathrooms: true,
    number_of_bedrooms: true,
}

@Injectable()
export class HomeService {
    constructor(private readonly prismaService: PrismaService) {

    }
    async getHomes(filter: GetHomesParams) : Promise<HomeResponseDto[]> {
        const homes = await this.prismaService.home.findMany({
            select: {
                id: true,
                address: true,
                city: true,
                price: true,
                propertyType: true,
                number_of_bathrooms: true,
                number_of_bedrooms: true,
                images: {
                    select: {
                        url: true,
                    },
                    take: 1,
                }
            },
            where: filter
        });
        return homes.map(home => {
            const fetchedHome = {
                ...home,
                image: home.images[0].url
            }
            delete fetchedHome.images;
            return new HomeResponseDto(fetchedHome)
        });
    }

    async getHomeById(id:number): Promise<HomeResponseDto> {
        const home = await this.prismaService.home.findUnique({
            where: { 
                id
            },
            select: {
                ...homeSelect,
                images: {
                    select: {
                        url: true,
                    },
                },
                realtor: {
                    select: {
                        name: true,
                        email: true,
                        phone: true,
                    }
                }
            },
        });

        if(!home) {
            throw new NotFoundException();
        }

        return new HomeResponseDto(home);
    }

    async createHome({ address, numberOfBathrooms, numberOfBedrooms, city, landSize, price, propertyType, images} : CreateHomeParams) {
        const home = await this.prismaService.home.create({
            data: {
                address,
                number_of_bathrooms: numberOfBathrooms,
                number_of_bedrooms: numberOfBedrooms,
                city,
                land_size: landSize,
                propertyType,
                price,
                realtor_id: 8
            }
        })

        const homeImages = images.map(image=> { return { ...image, home_id: home.id}})

        await this.prismaService.image.createMany({data: homeImages});

        return new HomeResponseDto(home);
    }

    async updateHomeByID(id: number, data: UpdateHomeParams) {
        const home = await this.prismaService.home.findUnique({
            where: {
                id
            }
        });

        if (!home) {
            throw new NotFoundException();
        }

        const updatedHome = await this.prismaService.home.update({
            where: {
                id
            },
            data
        });
    }

    async deleteHomeById(id: number) {
        await this.prismaService.image.deleteMany({
            where: {
                home_id: id
            }
        });
        await this.prismaService.home.delete({
            where: {
                id
            }
        })
    }
}
