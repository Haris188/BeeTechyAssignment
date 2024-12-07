import request from 'supertest';
import {parameterizedApp} from '../src/app';
import { PrismaClient } from '@prisma/client';
import nock from 'nock';

const prisma = new PrismaClient();

describe('City API Tests', () => {
  beforeEach(async () => {
    // Clear the database before each test
    await prisma.city.deleteMany();
  });

  afterAll(async () => {
    // Disconnect Prisma after all tests
    await prisma.$disconnect();
  });

  const app = parameterizedApp(prisma)

  describe('POST /api/cities', () => {
    it('should create a new city and return 201 with the city details', async () => {
      const response = await request(app).post('/api/cities').send({ name: 'New York' });

      // Validate response status and structure
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toMatchObject({ name: 'New York' });

      // Validate that the city exists in the database
      const savedCity = await prisma.city.findUnique({ where: { id: response.body.id } });
      expect(savedCity).toBeTruthy();
      expect(savedCity?.name).toBe('New York');
    });

    it('should return 400 if the city name is missing', async () => {
      const response = await request(app).post('/api/cities').send({});
      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({ error: 'City name is required' });
    });

    it('should return 400 if the city name is an empty string', async () => {
      const response = await request(app).post('/api/cities').send({ name: '' });
      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({ error: 'City name cannot be empty' });
    });

    it('should return 400 if the city name exceeds maximum length', async () => {
      const longCityName = 'A'.repeat(256);
      const response = await request(app).post('/api/cities').send({ name: longCityName });
      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({ error: 'City name is too long' });
    });

    it('should handle database errors gracefully and return 500', async () => {
      const mockCreate = jest.spyOn(prisma.city, 'create').mockRejectedValue(new Error('Database error'));

      const response = await request(app).post('/api/cities').send({ name: 'Los Angeles' });

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({ error: 'Failed to create city' });

      mockCreate.mockRestore();
    });
  });

  describe('GET /api/cities/:id/weather', () => {
    it('should return weather data for a valid city ID', async () => {
      
    // Mock the external weather API response
    nock('https://api.weather.com')
      .get('/weather')
      .query({ city: 'San Francisco' })
      .reply(200, {
        temperature: 25,
        description: 'Sunny',
      });

      // Add a city to the database
      const city = await prisma.city.create({ data: { name: 'San Francisco' } });

      const response = await request(app).get(`/api/cities/${city.id}/weather`);

      // Validate the response structure and data
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
                                            cityName: 'San Francisco',
                                            temperature: 25, // Simulated data
                                            description: 'Sunny', // Simulated data
                                          });
    });

    it('should return 404 if the city ID does not exist', async () => {
      const response = await request(app).get('/api/cities/999/weather');
      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({ error: 'City not found' });
    });

    it('should return 400 for invalid city ID format', async () => {
      const response = await request(app).get('/api/cities/invalid-id/weather');
      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({ error: 'Invalid city ID' });
    });

    it('should handle database errors gracefully when fetching weather data', async () => {
      const mockFindUnique = jest.spyOn(prisma.city, 'findUnique').mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/cities/1/weather');

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({ error: 'Failed to fetch weather data' });

      mockFindUnique.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    it('should not allow duplicate city names and return 400', async () => {
      // Create a city
      await prisma.city.create({ data: { name: 'Miami' } });

      // Attempt to create a duplicate city
      const response = await request(app).post('/api/cities').send({ name: 'Miami' });
      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({ error: 'City already exists' });
    });
  });
});
