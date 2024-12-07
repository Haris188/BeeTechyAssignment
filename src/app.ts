import express from 'express';
import dotenv from 'dotenv';
import { City, Prisma, PrismaClient } from '@prisma/client';
import axios, { Axios } from 'axios';

dotenv.config();

export const parameterizedApp = (prismaClient: PrismaClient | null = null) => {
    const prisma = prismaClient || new PrismaClient()

    const app = express();

    app.use(express.json());

    app.post('/api/cities', async (req, res) => {
        const cityData = req.body

        if (!("name" in cityData)) {
            return res.status(400).json({ error: 'City name is required' })
        }
        if (cityData.name?.length < 1) {
            return res.status(400).json({ error: 'City name cannot be empty' })
        }
        if (cityData.name?.length > 255) {
            return res.status(400).json({ error: 'City name is too long' })
        }

        let duplicateCity: City | null

        try {
            duplicateCity = await prisma.city.findUnique({where: {name: cityData.name}})
        }
        catch (e) {
            return res.status(500).json({ error: 'Database Error Occured' })
        }

        if(duplicateCity?.id){
            return res.status(400).json({ error: 'City already exists' })
        }

        let result: City

        try {
            result = await prisma.city.create({
                data: {
                    name: cityData.name
                }
            })
        }
        catch (e) {
            return res.status(500).json({ error: 'Failed to create city' })
        }

        res.status(201).json(result)
    })

    app.get('/api/cities/:city_id/weather', async (req, res) => {
        const city_id = parseInt(req.params.city_id)

        if (isNaN(city_id)) {
            return res.status(400).json({ error: 'Invalid city ID' })
        }

        let city: City | null

        try {
            city = await prisma.city.findUnique({ where: { id: city_id } })
        }
        catch (e) {
            return res.status(500).json({ error: 'Failed to fetch weather data' })
        }

        if (!city?.id) {
            return res.status(404).json({ error: 'City not found' })
        }

        const weatherAxios = new Axios({ baseURL: 'https://api.weather.com' })
        const weatherResult = await weatherAxios.get(`/weather`, { params: { city: city?.name } })

        if(!weatherResult?.data){
            return res.status(500).json({ error: 'Weather data is not available' })
        }

        const resultJson = {
            ...JSON.parse(weatherResult.data),
            cityName: city?.name
        }

        res.status(200).json(resultJson)
    })

    return app
}


export default parameterizedApp();