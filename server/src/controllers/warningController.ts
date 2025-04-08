import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Warning from '../models/Warning';
import Machine from '../models/Machine';

// Get all warnings
export const getAllWarnings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { machine_id, status, severity, type } = req.query;
    
    const query: any = {};
    
    if (machine_id) query.machine_id = machine_id;
    if (status) query.status = status;
    if (severity) query.severity = severity;
    if (type) query.type = type;
    
    const warnings = await Warning.find(query)
      .sort({ created_at: -1 })
      .populate('machine_id')
      .populate('order_id');
      
    res.status(200).json({
      success: true,
      count: warnings.length,
      data: warnings
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get single warning
export const getWarningById = async (req: Request, res: Response): Promise<void> => {
  try {
    const warning = await Warning.findOne({ warning_id: req.params.warningId })
      .populate('machine_id')
      .populate('order_id');

    if (!warning) {
      res.status(404).json({
        success: false,
        message: 'Warning not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: warning
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Create new warning
export const createWarning = async (req: Request, res: Response): Promise<void> => {
  try {
    const { machine_id, order_id, type, severity, message } = req.body;
    
    // Verify machine exists
    const machine = await Machine.findOne({ machine_id });
    if (!machine) {
      res.status(404).json({
        success: false,
        message: 'Machine not found'
      });
      return;
    }
    
    const warning = await Warning.create({
      warning_id: uuidv4(),
      machine_id,
      order_id,
      type,
      severity,
      message,
      status: 'active',
      created_at: new Date()
    });

    res.status(201).json({
      success: true,
      data: warning
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Resolve warning
export const resolveWarning = async (req: Request, res: Response): Promise<void> => {
  try {
    const warning = await Warning.findOne({ warning_id: req.params.warningId });

    if (!warning) {
      res.status(404).json({
        success: false,
        message: 'Warning not found'
      });
      return;
    }
    
    if (warning.status === 'resolved') {
      res.status(400).json({
        success: false,
        message: 'Warning is already resolved'
      });
      return;
    }

    const updatedWarning = await Warning.findOneAndUpdate(
      { warning_id: req.params.warningId },
      { status: 'resolved', resolved_at: new Date() },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: updatedWarning
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Delete warning
export const deleteWarning = async (req: Request, res: Response): Promise<void> => {
  try {
    const warning = await Warning.findOne({ warning_id: req.params.warningId });

    if (!warning) {
      res.status(404).json({
        success: false,
        message: 'Warning not found'
      });
      return;
    }

    await Warning.findOneAndDelete({ warning_id: req.params.warningId });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};