/**
 * Example components demonstrating API client and service usage
 * These are for reference and can be removed in production
 */

import React from 'react';
import { 
  useLogin, 
  useUserProfile, 
  usePaymentHistory, 
  useMunicipalities,
  useInitiatePayment 
} from '../../hooks';
import { LoginRequest, PaymentRequest } from '@municollect/shared';

// Example: Login Form Component
export function LoginExample() {
  const { execute: login, loading, error } = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const loginData: LoginRequest = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    try {
      await login(loginData);
      // Handle successful login (redirect, update state, etc.)
    } catch (error) {
      // Error is already handled by the hook
      console.log('Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Password" required />
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}

// Example: User Profile Component
export function UserProfileExample() {
  const { data: profile, loading, error, execute: refetch } = useUserProfile({ enabled: true });

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!profile) return <div>No profile data</div>;

  return (
    <div>
      <h2>User Profile</h2>
      <p>Name: {profile.user.firstName} {profile.user.lastName}</p>
      <p>Email: {profile.user.email}</p>
      <p>Role: {profile.user.role}</p>
      
      <h3>Municipalities</h3>
      <ul>
        {profile.municipalities.map(municipality => (
          <li key={municipality.id}>{municipality.name}</li>
        ))}
      </ul>
      
      <button onClick={() => refetch()}>Refresh Profile</button>
    </div>
  );
}

// Example: Payment History Component
export function PaymentHistoryExample() {
  const { 
    data: paymentHistory, 
    loading, 
    error 
  } = usePaymentHistory(
    { limit: 10, offset: 0 }, 
    { enabled: true, refetchInterval: 30000 } // Refetch every 30 seconds
  );

  if (loading) return <div>Loading payment history...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!paymentHistory) return <div>No payment history</div>;

  return (
    <div>
      <h2>Payment History</h2>
      <p>Total payments: {paymentHistory.total}</p>
      
      <ul>
        {paymentHistory.payments.map(payment => (
          <li key={payment.id}>
            <strong>{payment.serviceType}</strong> - 
            ${payment.amount} {payment.currency} - 
            Status: {payment.status}
            <br />
            <small>Created: {new Date(payment.createdAt).toLocaleDateString()}</small>
          </li>
        ))}
      </ul>
      
      {paymentHistory.hasMore && (
        <button>Load More</button>
      )}
    </div>
  );
}

// Example: Municipality Selector Component
export function MunicipalitySelectorExample() {
  const { data: municipalityData, loading, error } = useMunicipalities({ enabled: true });

  if (loading) return <div>Loading municipalities...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!municipalityData) return <div>No municipalities available</div>;

  return (
    <select>
      <option value="">Select a municipality</option>
      {municipalityData.municipalities.map(municipality => (
        <option key={municipality.id} value={municipality.id}>
          {municipality.name} ({municipality.code})
        </option>
      ))}
    </select>
  );
}

// Example: Payment Initiation Component
export function PaymentInitiationExample() {
  const { execute: initiatePayment, loading, error, data: paymentResponse } = useInitiatePayment();

  const handlePayment = async () => {
    const paymentData: PaymentRequest = {
      municipalityId: 'example-municipality-id',
      serviceType: 'waste_management',
      amount: 50.00,
      currency: 'USD',
      userDetails: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890'
      }
    };

    try {
      await initiatePayment(paymentData);
      // Payment initiated successfully
    } catch (error) {
      // Error handled by hook
      console.log('Payment initiation failed');
    }
  };

  return (
    <div>
      <button onClick={handlePayment} disabled={loading}>
        {loading ? 'Processing...' : 'Pay Waste Management Fee'}
      </button>
      
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      
      {paymentResponse && (
        <div>
          <h3>Payment Initiated</h3>
          <p>Payment ID: {paymentResponse.id}</p>
          <p>Status: {paymentResponse.status}</p>
          <p>QR Code: {paymentResponse.qrCode}</p>
          <p>Expires: {new Date(paymentResponse.expiresAt).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}

// Example: Error Handling Component
export function ErrorHandlingExample() {
  const [manualError, setManualError] = React.useState<string | null>(null);

  const { execute: login } = useLogin();

  const triggerError = async () => {
    try {
      // This will fail and demonstrate error handling
      await login({ email: 'invalid', password: 'invalid' });
    } catch (error) {
      setManualError('Login failed as expected');
    }
  };

  return (
    <div>
      <h3>Error Handling Example</h3>
      <button onClick={triggerError}>Trigger Login Error</button>
      {manualError && <p>{manualError}</p>}
    </div>
  );
}