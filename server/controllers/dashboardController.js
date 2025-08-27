const Client = require('../models/Client');
const Project = require('../models/Project');
const Invoice = require('../models/Invoice');
const Receipt = require('../models/Receipt');
const Task = require('../models/Task');
const Notification = require('../models/Notification');

// Get dashboard statistics
const getStats = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    // Get counts from all models
    const [
      totalClients,
      activeProjects,
      outstandingInvoices,
      totalReceipts,
      pendingTasks,
      totalRevenue,
      lastMonthRevenue
    ] = await Promise.all([
      // Total Clients (All statuses)
      Client.countDocuments({ 
        createdBy: userId
      }),
      
      // Total Projects (All statuses, not archived)
      Project.countDocuments({ 
        createdBy: userId, 
        isArchived: false 
      }),
      
      // Outstanding Invoices (pending status)
      Invoice.countDocuments({ 
        createdBy: userId, 
        status: 'pending' 
      }),
      
      // Total Receipts
      Receipt.countDocuments({ 
        createdBy: userId 
      }),
      
      // Pending Tasks (not completed)
      Task.countDocuments({ 
        createdBy: userId, 
        completed: false,
        isArchived: false 
      }),
      
      // Total Revenue (sum of all receipts)
      Receipt.aggregate([
        { $match: { createdBy: userId } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      
      // Last Month Revenue
      Receipt.aggregate([
        { 
          $match: { 
            createdBy: userId,
            paymentDate: { 
              $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
              $lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          } 
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    // Calculate revenue change percentage
    const currentRevenue = totalRevenue[0]?.total || 0;
    const previousRevenue = lastMonthRevenue[0]?.total || 0;
    const revenueChange = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;

    // Get additional stats for comparison
    const lastMonthClients = await Client.countDocuments({
      createdBy: userId,
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
        $lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
    });

    const currentMonthClients = await Client.countDocuments({
      createdBy: userId,
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
    });

    const clientsChange = lastMonthClients > 0 
      ? ((currentMonthClients - lastMonthClients) / lastMonthClients) * 100 
      : 0;

    // Calculate project changes
    const lastMonthProjects = await Project.countDocuments({
      createdBy: userId,
      isArchived: false,
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
        $lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
    });

    const currentMonthProjects = await Project.countDocuments({
      createdBy: userId,
      isArchived: false,
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
    });

    const projectsChange = lastMonthProjects > 0 
      ? ((currentMonthProjects - lastMonthProjects) / lastMonthProjects) * 100 
      : 0;

    // Calculate task changes
    const lastMonthTasks = await Task.countDocuments({
      createdBy: userId,
      completed: false,
      isArchived: false,
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
        $lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
    });

    const currentMonthTasks = await Task.countDocuments({
      createdBy: userId,
      completed: false,
      isArchived: false,
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
    });

    const tasksChange = lastMonthTasks > 0 
      ? ((currentMonthTasks - lastMonthTasks) / lastMonthTasks) * 100 
      : 0;

    // Calculate invoice changes
    const lastMonthInvoices = await Invoice.countDocuments({
      createdBy: userId,
      status: 'pending',
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
        $lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
    });

    const currentMonthInvoices = await Invoice.countDocuments({
      createdBy: userId,
      status: 'pending',
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
    });

    const invoicesChange = lastMonthInvoices > 0 
      ? ((currentMonthInvoices - lastMonthInvoices) / lastMonthInvoices) * 100 
      : 0;

    res.json({
      success: true,
      data: {
        totalClients,
        totalProjects: activeProjects, // Rename for clarity
        outstandingInvoices,
        totalReceipts,
        pendingTasks,
        totalRevenue: currentRevenue,
        revenueChange: Math.round(revenueChange * 100) / 100,
        clientsChange: Math.round(clientsChange * 100) / 100,
        projectsChange: Math.round(projectsChange * 100) / 100,
        tasksChange: Math.round(tasksChange * 100) / 100,
        invoicesChange: Math.round(invoicesChange * 100) / 100
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
};

// Get recent activity
const getRecentActivity = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const limit = parseInt(req.query.limit) || 10;

    // Get recent activities from different models
    const [
      recentInvoices,
      recentClients,
      recentProjects,
      recentNotifications
    ] = await Promise.all([
      // Recent invoices
      Invoice.find({ createdBy: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('projectId', 'name'),
      
      // Recent clients
      Client.find({ createdBy: userId })
        .sort({ createdAt: -1 })
        .limit(5),
      
      // Recent projects
      Project.find({ createdBy: userId, isArchived: false })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('clientId', 'name companyName'),
      
      // Recent notifications
      Notification.find({ userId, isArchived: false })
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    // Combine and format activities
    const activities = [];

    // Add invoice activities
    recentInvoices.forEach(invoice => {
      activities.push({
        id: invoice._id,
        type: 'invoice',
        title: `Invoice #${invoice.number}`,
        description: `Invoice sent to ${invoice.client}`,
        time: invoice.createdAt,
        status: invoice.status,
        amount: invoice.total
      });
    });

    // Add client activities
    recentClients.forEach(client => {
      activities.push({
        id: client._id,
        type: 'client',
        title: `New Client Added`,
        description: `${client.name} joined as a new client`,
        time: client.createdAt,
        status: client.status.toLowerCase()
      });
    });

    // Add project activities
    recentProjects.forEach(project => {
      activities.push({
        id: project._id,
        type: 'project',
        title: project.name,
        description: `Project ${project.status.toLowerCase()} for ${project.clientId?.name || project.clientId?.companyName || 'Client'}`,
        time: project.createdAt,
        status: project.status.toLowerCase()
      });
    });

    // Add notification activities
    recentNotifications.forEach(notification => {
      activities.push({
        id: notification._id,
        type: 'notification',
        title: notification.title,
        description: notification.message,
        time: notification.createdAt,
        status: notification.isRead ? 'read' : 'unread',
        priority: notification.priority
      });
    });

    // Sort by time and limit
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    const limitedActivities = activities.slice(0, limit);

    res.json({
      success: true,
      data: limitedActivities
    });
  } catch (error) {
    console.error('Recent activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activity',
      error: error.message
    });
  }
};

// Get upcoming deadlines
const getUpcomingDeadlines = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const limit = parseInt(req.query.limit) || 10;

    // Get upcoming deadlines from projects and tasks
    const [
      upcomingProjects,
      upcomingTasks
    ] = await Promise.all([
      // Projects due soon (within 30 days)
      Project.find({
        createdBy: userId,
        isArchived: false,
        status: { $ne: 'Completed' },
        dueDate: {
          $gte: new Date(),
          $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        }
      })
        .populate('clientId', 'name companyName')
        .sort({ dueDate: 1 })
        .limit(limit),
      
      // Tasks due soon (within 7 days)
      Task.find({
        createdBy: userId,
        isArchived: false,
        completed: false,
        dueDate: {
          $gte: new Date(),
          $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        }
      })
        .populate('projectId', 'name')
        .sort({ dueDate: 1 })
        .limit(limit)
    ]);

    // Combine and format deadlines
    const deadlines = [];

    // Add project deadlines
    upcomingProjects.forEach(project => {
      const daysUntil = Math.ceil((new Date(project.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
      deadlines.push({
        id: project._id,
        title: project.name,
        client: project.clientId?.name || project.clientId?.companyName || 'Unknown Client',
        dueDate: project.dueDate,
        priority: project.priority.toLowerCase(),
        type: 'project',
        daysUntil,
        isOverdue: daysUntil < 0
      });
    });

    // Add task deadlines
    upcomingTasks.forEach(task => {
      const daysUntil = Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
      deadlines.push({
        id: task._id,
        title: task.name,
        client: task.projectId?.name || 'Unknown Project',
        dueDate: task.dueDate,
        priority: task.priority.toLowerCase(),
        type: 'task',
        daysUntil,
        isOverdue: daysUntil < 0
      });
    });

    // Sort by due date and limit
    deadlines.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    const limitedDeadlines = deadlines.slice(0, limit);

    res.json({
      success: true,
      data: limitedDeadlines
    });
  } catch (error) {
    console.error('Upcoming deadlines error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming deadlines',
      error: error.message
    });
  }
};

// Get revenue chart data
const getRevenueChart = async (req, res) => {
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

    const revenueData = await Receipt.aggregate([
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

    res.json({
      success: true,
      data: revenueData
    });
  } catch (error) {
    console.error('Revenue chart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue chart data',
      error: error.message
    });
  }
};

// Get project progress
const getProjectProgress = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const projects = await Project.find({
      createdBy: userId,
      isArchived: false,
      status: { $ne: 'Completed' }
    })
      .populate('clientId', 'name companyName')
      .sort({ dueDate: 1 })
      .limit(10);

    const projectProgress = projects.map(project => ({
      id: project._id,
      name: project.name,
      client: project.clientId?.name || project.clientId?.companyName || 'Unknown Client',
      progress: project.progress,
      status: project.status,
      dueDate: project.dueDate,
      priority: project.priority,
      daysUntilDue: Math.ceil((new Date(project.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
    }));

    res.json({
      success: true,
      data: projectProgress
    });
  } catch (error) {
    console.error('Project progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project progress',
      error: error.message
    });
  }
};

// Get task summary
const getTaskSummary = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const [
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks
    ] = await Promise.all([
      Task.countDocuments({ createdBy: userId, isArchived: false }),
      Task.countDocuments({ createdBy: userId, completed: true, isArchived: false }),
      Task.countDocuments({ createdBy: userId, completed: false, isArchived: false }),
      Task.countDocuments({
        createdBy: userId,
        completed: false,
        isArchived: false,
        dueDate: { $lt: new Date() }
      })
    ]);

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    res.json({
      success: true,
      data: {
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        completionRate: Math.round(completionRate * 100) / 100
      }
    });
  } catch (error) {
    console.error('Task summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch task summary',
      error: error.message
    });
  }
};

// Get client metrics
const getClientMetrics = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const [
      totalClients,
      activeClients,
      newClientsThisMonth,
      topClients
    ] = await Promise.all([
      Client.countDocuments({ createdBy: userId }),
      Client.countDocuments({ createdBy: userId, status: 'Active' }),
      Client.countDocuments({
        createdBy: userId,
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }),
      // Get top clients by revenue
      Receipt.aggregate([
        { $match: { createdBy: userId } },
        {
          $group: {
            _id: '$clientId',
            totalRevenue: { $sum: '$amount' },
            paymentCount: { $sum: 1 }
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
        { $unwind: '$client' },
        { $match: { 'client.name': { $exists: true } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalClients,
        activeClients,
        newClientsThisMonth,
        topClients: topClients.map(client => ({
          id: client._id,
          name: client.client?.name || 'Unknown Client',
          totalRevenue: client.totalRevenue,
          paymentCount: client.paymentCount
        }))
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

module.exports = {
  getStats,
  getRecentActivity,
  getUpcomingDeadlines,
  getRevenueChart,
  getProjectProgress,
  getTaskSummary,
  getClientMetrics
};
