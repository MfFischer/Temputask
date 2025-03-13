// src/pages/terms.js
import React from 'react';
import Head from 'next/head';

export default function TermsPage() {
  return (
    <>
      <Head>
        <title>Terms of Service | Tempu Task</title>
      </Head>
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Terms of Service</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Last updated: March 1, 2025</p>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 sm:p-8 space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 dark:text-gray-300">
                By accessing or using Tempu Task, you agree to be bound by these Terms of Service and all applicable
                laws and regulations. If you do not agree with any of these terms, you are prohibited from using or
                accessing Tempu Task.
              </p>
            </section>
            
            <div className="border-t border-gray-200 dark:border-slate-700"></div>
            
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">2. Use License</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                Tempu Task grants you a limited, non-exclusive, non-transferable, revocable license to access and use
                our service for personal or business productivity purposes.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                This license does not include:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mt-3">
                <li>Modifying or copying our intellectual property</li>
                <li>Using the material for any commercial purpose outside the scope of the service</li>
                <li>Attempting to reverse engineer any software contained on Tempu Task</li>
                <li>Removing any copyright or other proprietary notations</li>
              </ul>
            </section>
            
            <div className="border-t border-gray-200 dark:border-slate-700"></div>
            
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">3. User Accounts</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                To use certain features of Tempu Task, you must create an account. You are responsible for:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>Maintaining the confidentiality of your account information</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use or security breaches</li>
              </ul>
            </section>
            
            <div className="border-t border-gray-200 dark:border-slate-700"></div>
            
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">4. Data Usage and Privacy</h2>
              <p className="text-gray-700 dark:text-gray-300">
                Your use of Tempu Task is also governed by our Privacy Policy, which is incorporated by reference into these Terms of Service.
                Please review our Privacy Policy to understand our practices regarding your data.
              </p>
            </section>
            
            <div className="border-t border-gray-200 dark:border-slate-700"></div>
            
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">5. Limitation of Liability</h2>
              <p className="text-gray-700 dark:text-gray-300">
                Tempu Task shall not be liable for any indirect, incidental, special, consequential or punitive damages,
                including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from
                your access to or use of or inability to access or use the service.
              </p>
            </section>
            
            <div className="border-t border-gray-200 dark:border-slate-700"></div>
            
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">6. Service Modifications</h2>
              <p className="text-gray-700 dark:text-gray-300">
                Tempu Task reserves the right to modify or discontinue, temporarily or permanently, the service
                (or any part thereof) with or without notice. We shall not be liable to you or to any third party
                for any modification, suspension or discontinuance of the service.
              </p>
            </section>
            
            <div className="border-t border-gray-200 dark:border-slate-700"></div>
            
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">7. Governing Law</h2>
              <p className="text-gray-700 dark:text-gray-300">
                These Terms shall be governed by and construed in accordance with the laws of European Union (EU),
                without regard to its conflict of law provisions.
              </p>
            </section>
            
            <div className="border-t border-gray-200 dark:border-slate-700"></div>
            
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">8. Contact Information</h2>
              <p className="text-gray-700 dark:text-gray-300">
                If you have any questions about these Terms, please contact us at:
                <a href="mailto:support@temputaskcom" className="text-indigo-600 dark:text-indigo-400 hover:underline ml-1">
                  support@temputaskcom
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}