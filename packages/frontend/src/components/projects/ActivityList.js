import React, { useState } from 'react';
import AddActivityForm from './AddActivityForm';

const ActivityList = ({ activities, projectId, onAddActivity, onUpdateActivity, onDeleteActivity }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);

  const handleAddClick = () => {
    setEditingActivity(null);
    setShowAddForm(true);
  };

  const handleEditClick = (activity) => {
    setEditingActivity(activity);
    setShowAddForm(true);
  };

  const handleDeleteClick = async (activityId) => {
    if (window.confirm('Are you sure you want to delete this activity? This action cannot be undone.')) {
      try {
        await onDeleteActivity(activityId);
      } catch (error) {
        console.error('Error deleting activity:', error);
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingActivity) {
        await onUpdateActivity({ ...formData, id: editingActivity.id });
      } else {
        await onAddActivity(formData);
      }
      setShowAddForm(false);
      setEditingActivity(null);
    } catch (error) {
      console.error('Error submitting activity:', error);
    }
  };

  const handleFormCancel = () => {
    setShowAddForm(false);
    setEditingActivity(null);
  };

  // Format currency for display
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return 'Not set';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold dark:text-white">Activities</h3>
        <button
          onClick={handleAddClick}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          Add Activity
        </button>
      </div>

      {showAddForm && (
        <AddActivityForm
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          projectId={projectId}
          initialData={editingActivity}
        />
      )}

      {activities && activities.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Hourly Rate
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-700 dark:divide-gray-600">
              {activities.map((activity) => (
                <tr key={activity.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {activity.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {activity.description || 'No description'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {formatCurrency(activity.hourly_rate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditClick(activity)}
                      className="text-primary-600 hover:text-primary-900 dark:hover:text-primary-400 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(activity.id)}
                      className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          <p>No activities found. Add your first activity to get started.</p>
        </div>
      )}
    </div>
  );
};

export default ActivityList;