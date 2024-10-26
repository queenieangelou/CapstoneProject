// server/controller/clientPortal.controller.js
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import Deployment from '../mongodb/models/deployment.js';

dotenv.config();

export const searchClientByName = async (req, res) => {
    try {
        const { searchQuery } = req.query;
        
        // Input validation
        if (!searchQuery || typeof searchQuery !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid search query'
            });
        }

        // Create case-insensitive search pattern
        const searchPattern = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        
        // Query MongoDB using Deployment model
        const deployment = await Deployment.findOne({
            clientName: { $regex: searchPattern }
        }).select('clientName vehicleModel releaseStatus releaseDate');
        
        // Handle no results
        if (!deployment) {
            return res.status(404).json({
                success: false,
                message: 'No client found with that name'
            });
        }

        // Transform the data to match the frontend interface
        const transformedData = {
            clientName: deployment.clientName,
            vehicle: deployment.vehicleModel,
            status: deployment.releaseStatus ? 'Released' : 'In Service',
            estimatedCompletion: deployment.releaseDate
        };

        // Send successful response
        return res.status(200).json({
            success: true,
            data: transformedData
        });

    } catch (error) {
        console.error('Search error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error searching for client',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};