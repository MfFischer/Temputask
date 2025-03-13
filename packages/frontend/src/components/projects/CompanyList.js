import React, { useState } from 'react';
import AddCompanyForm from './AddCompanyForm';

const CompanyList = ({ companies, onAddCompany, onUpdateCompany, onDeleteCompany }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);

  const handleAddClick = () => {
    setEditingCompany(null);
    setShowAddForm(true);
  };

  const handleEditClick = (company) => {
    setEditingCompany(company);
    setShowAddForm(true);
  };

  const handleDeleteClick = async (companyId) => {
    if (window.confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      try {
        await onDeleteCompany(companyId);
      } catch (error) {
        console.error('Error deleting company:', error);
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingCompany) {
        await onUpdateCompany({ ...formData, id: editingCompany.id });
      } else {
        await onAddCompany(formData);
      }
      setShowAddForm(false);
      setEditingCompany(null);
    } catch (error) {
      console.error('Error submitting company:', error);
    }
  };

  const handleFormCancel = () => {
    setShowAddForm(false);
    setEditingCompany(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold dark:text-white">Companies</h2>
        <button
          onClick={handleAddClick}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          Add Company
        </button>
      </div>

      {showAddForm && (
        <AddCompanyForm
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          initialData={editingCompany}
        />
      )}

      {companies && companies.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <div
              key={company.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-l-4"
              style={{ borderLeftColor: company.color }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg dark:text-white">
                    {company.name}
                  </h3>
                  {company.description && (
                    <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm">
                      {company.description}
                    </p>
                  )}
                </div>
                <div className="flex">
                  <button
                    onClick={() => handleEditClick(company)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mr-2"
                    title="Edit company"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteClick(company.id)}
                    className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                    title="Delete company"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No companies found. Add your first company to get started.</p>
        </div>
      )}
    </div>
  );
};

export default CompanyList;