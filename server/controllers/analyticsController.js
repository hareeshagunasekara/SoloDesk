const Client = require('../models/Client');
const Project = require('../models/Project');
const Invoice = require('../models/Invoice');
const Receipt = require('../models/Receipt');
const Task = require('../models/Task');

// Get comprehensive analytics data
const getAnalytics = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const period = req.query.period || '30'; // days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get all analytics data
    const [
      revenueData,
      clientData,
      projectData,
      taskData
    ] = await Promise.all([
      getRevenueAnalytics(userId, startDate),
      getClientAnalytics(userId, startDate),
      getProjectAnalytics(userId, startDate),
      getTaskAnalytics(userId, startDate)
    ]);

    res.json({
      success: true,
      data: {
        revenue: revenueData,
        clients: clientData,
        projects: projectData,
        tasks: taskData
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data',
      error: error.message
    });
  }
};

// Get detailed revenue analytics
const getRevenueData = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const period = req.query.period || 'month'; // month, quarter, year

    let startDate, endDate, groupFormat;

    switch (period) {
      case 'month':
        startDate = new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1);
        endDate = new Date();
        groupFormat = '%Y-%m';
        break;
      case 'quarter':
        startDate = new Date(new Date().getFullYear() - 3, 0, 1);
        endDate = new Date();
        groupFormat = '%Y-Q%q';
        break;
      case 'year':
        startDate = new Date(new Date().getFullYear() - 5, 0, 1);
        endDate = new Date();
        groupFormat = '%Y';
        break;
      default:
        startDate = new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1);
        endDate = new Date();
        groupFormat = '%Y-%m';
    }

    // Get revenue over time
    const revenueOverTime = await Receipt.aggregate([
      {
        $match: {
          createdBy: userId,
          paymentDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: groupFormat,
              date: '$paymentDate'
            }
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get paid vs unpaid invoices
    const [paidInvoices, unpaidInvoices] = await Promise.all([
      Invoice.countDocuments({
        createdBy: userId,
        status: 'paid'
      }),
      Invoice.countDocuments({
        createdBy: userId,
        status: 'pending'
      })
    ]);

    // Get top-paying clients
    const topClients = await Receipt.aggregate([
      { $match: { createdBy: userId } },
      {
        $group: {
          _id: '$clientId',
          totalRevenue: { $sum: '$amount' },
          paymentCount: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'clients',
          localField: '_id',
          foreignField: '_id',
          as: 'client'
        }
      },
      { $unwind: '$client' }
    ]);

    res.json({
      success: true,
      data: {
        revenueOverTime,
        paidInvoices,
        unpaidInvoices,
        topClients: topClients.map(client => ({
          id: client._id,
          name: client.client?.name || 'Unknown Client',
          totalRevenue: client.totalRevenue,
          paymentCount: client.paymentCount
        }))
      }
    });
  } catch (error) {
    console.error('Revenue analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue analytics',
      error: error.message
    });
  }
};

// Get client insights and metrics
const getClientMetrics = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 12);

    // Get client growth over time
    const clientGrowth = await Client.aggregate([
      {
        $match: {
          createdBy: userId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m',
              date: '$createdAt'
            }
          },
          newClients: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get most active clients by projects
    const activeClients = await Project.aggregate([
      {
        $match: {
          createdBy: userId,
          isArchived: false
        }
      },
      {
        $group: {
          _id: '$clientId',
          projectCount: { $sum: 1 },
          totalValue: { $sum: '$budget' }
        }
      },
      { $sort: { projectCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'clients',
          localField: '_id',
          foreignField: '_id',
          as: 'client'
        }
      },
      { $unwind: '$client' }
    ]);

    // Get client status distribution
    const clientStatus = await Client.aggregate([
      {
        $match: { createdBy: userId }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        clientGrowth,
        activeClients: activeClients.map(client => ({
          id: client._id,
          name: client.client?.name || 'Unknown Client',
          projectCount: client.projectCount,
          totalValue: client.totalValue
        })),
        clientStatus
      }
    });
  } catch (error) {
    console.error('Client metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch client metrics',
      error: error.message
    });
  }
};

// Get project and task productivity metrics
const getProjectMetrics = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 12);

    // Get task completion rates
    const [totalTasks, completedTasks, pendingTasks] = await Promise.all([
      Task.countDocuments({ createdBy: userId, isArchived: false }),
      Task.countDocuments({ createdBy: userId, completed: true, isArchived: false }),
      Task.countDocuments({ createdBy: userId, completed: false, isArchived: false })
    ]);

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Get average project duration
    const projectDuration = await Project.aggregate([
      {
        $match: {
          createdBy: userId,
          isArchived: false,
          status: 'Completed',
          startDate: { $exists: true },
          dueDate: { $exists: true }
        }
      },
      {
        $addFields: {
          duration: {
            $divide: [
              { $subtract: ['$dueDate', '$startDate'] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: '$duration' },
          minDuration: { $min: '$duration' },
          maxDuration: { $max: '$duration' }
        }
      }
    ]);

    // Get deadlines met vs missed
    const [metDeadlines, missedDeadlines] = await Promise.all([
      Project.countDocuments({
        createdBy: userId,
        isArchived: false,
        status: 'Completed',
        completedDate: { $lte: '$dueDate' }
      }),
      Project.countDocuments({
        createdBy: userId,
        isArchived: false,
        status: 'Completed',
        completedDate: { $gt: '$dueDate' }
      })
    ]);

    // Get project status distribution
    const projectStatus = await Project.aggregate([
      {
        $match: {
          createdBy: userId,
          isArchived: false
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        taskMetrics: {
          totalTasks,
          completedTasks,
          pendingTasks,
          completionRate: Math.round(completionRate * 100) / 100
        },
        projectDuration: projectDuration[0] || {
          avgDuration: 0,
          minDuration: 0,
          maxDuration: 0
        },
        deadlineMetrics: {
          metDeadlines,
          missedDeadlines,
          successRate: (metDeadlines + missedDeadlines) > 0 
            ? (metDeadlines / (metDeadlines + missedDeadlines)) * 100 
            : 0
        },
        projectStatus
      }
    });
  } catch (error) {
    console.error('Project metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project metrics',
      error: error.message
    });
  }
};

// Get time-based metrics and trends
const getTimeMetrics = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const period = req.query.period || 'month';

    let startDate, endDate;

    switch (period) {
      case 'week':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        endDate = new Date();
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        endDate = new Date();
        break;
      case 'quarter':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 3);
        endDate = new Date();
        break;
      case 'year':
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        endDate = new Date();
        break;
      default:
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        endDate = new Date();
    }

    // Get time-based trends
    const [
      revenueTrend,
      clientGrowth,
      projectTrend,
      taskTrend
    ] = await Promise.all([
      // Revenue trend
      Receipt.aggregate([
        {
          $match: {
            createdBy: userId,
            paymentDate: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$paymentDate'
              }
            },
            revenue: { $sum: '$amount' }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      // Client growth trend
      Client.aggregate([
        {
          $match: {
            createdBy: userId,
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt'
              }
            },
            newClients: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      // Project trend
      Project.aggregate([
        {
          $match: {
            createdBy: userId,
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt'
              }
            },
            newProjects: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      // Task completion trend
      Task.aggregate([
        {
          $match: {
            createdBy: userId,
            completedAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$completedAt'
              }
            },
            completedTasks: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        revenueTrend,
        clientGrowth,
        projectTrend,
        taskTrend
      }
    });
  } catch (error) {
    console.error('Time metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch time metrics',
      error: error.message
    });
  }
};

// Export analytics report
const exportReport = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const format = req.query.format || 'json';

    // Get comprehensive analytics data
    const analyticsData = await getComprehensiveAnalytics(userId);

    if (format === 'csv') {
      // TODO: Implement CSV export
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=analytics-report.csv');
      res.send('CSV export not yet implemented');
    } else {
      res.json({
        success: true,
        data: analyticsData
      });
    }
  } catch (error) {
    console.error('Export report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export report',
      error: error.message
    });
  }
};

// Helper functions
const getRevenueAnalytics = async (userId, startDate) => {
  const [totalRevenue, monthlyRevenue, topClients] = await Promise.all([
    Receipt.aggregate([
      { $match: { createdBy: userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    Receipt.aggregate([
      {
        $match: {
          createdBy: userId,
          paymentDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m',
              date: '$paymentDate'
            }
          },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]),
    Receipt.aggregate([
      { $match: { createdBy: userId } },
      {
        $group: {
          _id: '$clientId',
          totalRevenue: { $sum: '$amount' }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'clients',
          localField: '_id',
          foreignField: '_id',
          as: 'client'
        }
      },
      { $unwind: '$client' }
    ])
  ]);

  return {
    totalRevenue: totalRevenue[0]?.total || 0,
    monthlyRevenue,
    topClients: topClients.map(client => ({
      name: client.client?.name || 'Unknown Client',
      revenue: client.totalRevenue
    }))
  };
};

const getClientAnalytics = async (userId, startDate) => {
  const [totalClients, newClients, activeClients] = await Promise.all([
    Client.countDocuments({ createdBy: userId }),
    Client.countDocuments({
      createdBy: userId,
      createdAt: { $gte: startDate }
    }),
    Client.countDocuments({
      createdBy: userId,
      status: 'Active'
    })
  ]);

  return {
    totalClients,
    newClients,
    activeClients
  };
};

const getProjectAnalytics = async (userId, startDate) => {
  const [totalProjects, completedProjects, avgDuration] = await Promise.all([
    Project.countDocuments({ createdBy: userId, isArchived: false }),
    Project.countDocuments({
      createdBy: userId,
      isArchived: false,
      status: 'Completed'
    }),
    Project.aggregate([
      {
        $match: {
          createdBy: userId,
          isArchived: false,
          status: 'Completed',
          startDate: { $exists: true },
          dueDate: { $exists: true }
        }
      },
      {
        $addFields: {
          duration: {
            $divide: [
              { $subtract: ['$dueDate', '$startDate'] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: '$duration' }
        }
      }
    ])
  ]);

  return {
    totalProjects,
    completedProjects,
    completionRate: totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0,
    avgDuration: avgDuration[0]?.avgDuration || 0
  };
};

const getTaskAnalytics = async (userId, startDate) => {
  const [totalTasks, completedTasks, pendingTasks] = await Promise.all([
    Task.countDocuments({ createdBy: userId, isArchived: false }),
    Task.countDocuments({
      createdBy: userId,
      completed: true,
      isArchived: false
    }),
    Task.countDocuments({
      createdBy: userId,
      completed: false,
      isArchived: false
    })
  ]);

  return {
    totalTasks,
    completedTasks,
    pendingTasks,
    completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
  };
};

const getComprehensiveAnalytics = async (userId) => {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 12);

  const [revenue, clients, projects, tasks] = await Promise.all([
    getRevenueAnalytics(userId, startDate),
    getClientAnalytics(userId, startDate),
    getProjectAnalytics(userId, startDate),
    getTaskAnalytics(userId, startDate)
  ]);

  return {
    revenue,
    clients,
    projects,
    tasks,
    generatedAt: new Date()
  };
};

module.exports = {
  getAnalytics,
  getRevenueData,
  getClientMetrics,
  getProjectMetrics,
  getTimeMetrics,
  exportReport
};
