import React, { useState, useEffect } from 'react';
import {
  CreditCard, CheckCircle, X, Check, Wallet, Smartphone, Calendar,
  Building2, QrCode, Loader2, AlertCircle, Crown, Shield, ExternalLink
} from 'lucide-react';

import packageService from '../../services/packageService';
import paymentService from '../../services/paymentService';

export default function PaymentPage() {
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('zalopay');

  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [qrWindow, setQrWindow] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);

  useEffect(() => {
    const fetchPlans = async () => {
      setLoadingPlans(true);
      try {
        console.log("🚀 Loading packages...");
        const data = await packageService.getAll();

        let fetchedPlans = [];
        if (Array.isArray(data)) fetchedPlans = data;
        else if (data?.items && Array.isArray(data.items)) fetchedPlans = data.items;
        else if (data?.data && Array.isArray(data.data)) fetchedPlans = data.data;
        else if (data && typeof data === 'object') fetchedPlans = [data];

        const normalizedPlans = fetchedPlans.map(p => ({
          id: p.id || p._id || p.planId,
          name: p.name || 'Service Package',
          price: parseFloat(p.price) || 0,
          resetInterval: p.resetInterval || 'MONTHLY',
          duration: parseInt(p.duration) || 30,
          features: (Array.isArray(p.features) && p.features.length > 0)
            ? p.features
            : (p.description || '').split('\n').map(l => l.replace(/^[\s*-]*\s*/, '').trim()).filter(l => l.length > 0)
        }));

        setPlans(normalizedPlans);
        if (normalizedPlans.length > 0) setSelectedPlan(normalizedPlans[0]);
      } catch (err) {
        console.error("❌ Error loading plans:", err);
      } finally {
        setLoadingPlans(false);
      }
    };

    fetchPlans();
  }, []);

  // Cleanup: Stop polling and close window when component unmounts
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
      if (qrWindow && !qrWindow.closed) {
        qrWindow.close();
      }
    };
  }, [pollingInterval, qrWindow]);

  const paymentMethods = [
    { id: 'zalopay', name: 'ZaloPay', icon: Smartphone, description: 'ZaloPay wallet', color: 'blue' },
    { id: 'momo', name: 'MoMo', icon: Wallet, description: 'MoMo e-wallet', color: 'pink' },
    { id: 'vnpay', name: 'VNPAY QR', icon: QrCode, description: 'Scan QR code', color: 'red' },
    { id: 'card', name: 'Credit Card', icon: CreditCard, description: 'Visa, Mastercard', color: 'cyan' },
    { id: 'bank', name: 'Bank Transfer', icon: Building2, description: 'Domestic bank', color: 'green' }
  ];

  // Poll payment status
  const startPollingPaymentStatus = (orderId) => {
    console.log('🔄 Starting to poll payment status for:', orderId);

    const interval = setInterval(async () => {
      try {
        console.log('🔍 Checking payment status...');
        const statusResponse = await paymentService.checkPaymentStatus(orderId);

        console.log('📊 Status response:', statusResponse);

        // Check if payment is completed
        if (
          statusResponse?.status === 'COMPLETED' ||
          statusResponse?.status === 'completed' ||
          statusResponse?.status === 'SUCCESS' ||
          statusResponse?.paymentStatus === 'COMPLETED'
        ) {
          console.log('✅ Payment completed!');
          clearInterval(interval);
          setPollingInterval(null);
          handlePaymentSuccess(orderId);
        } else if (
          statusResponse?.status === 'FAILED' ||
          statusResponse?.status === 'CANCELLED' ||
          statusResponse?.status === 'EXPIRED'
        ) {
          console.log('❌ Payment failed/cancelled');
          clearInterval(interval);
          setPollingInterval(null);
          setProcessing(false);
          setPaymentStatus('failed');
          alert('Payment was cancelled or failed. Please try again.');
        }
      } catch (error) {
        console.error('❌ Error polling payment status:', error);
      }
    }, 3000); // Poll every 3 seconds

    setPollingInterval(interval);

    // Stop polling after 10 minutes (timeout)
    setTimeout(() => {
      clearInterval(interval);
      setPollingInterval(null);
      if (paymentStatus !== 'success') {
        setProcessing(false);
        alert('⏱️ Payment verification timeout. Please check your payment status in profile.');
      }
    }, 600000); // 10 minutes
  };

  const handlePaymentSuccess = (transactionId) => {
    console.log('✅ Payment successful, transaction ID:', transactionId);
    setOrderId(transactionId);
    setPaymentStatus('success');
    setProcessing(false);

    // Close QR window if open
    if (qrWindow && !qrWindow.closed) {
      qrWindow.close();
      setQrWindow(null);
    }

    setStep(3);
  };

  const handleSubmit = async () => {
    if (!selectedPlan) {
      alert('Please select a plan first');
      return;
    }

    try {
      setProcessing(true);

      // pass planId + paymentMethod (your service expects this)
      const res = await paymentService.createPayment(selectedPlan.id, paymentMethod);

      // res should now be the actual payment object (e.g. { qr: "...", orderId: "..." })
      console.log('📥 createPayment returned:', res);

      // tolerant extraction
      const qrUrl = res?.qr || res?.data?.qr || res?.paymentUrl || res?.payUrl;
      const newOrderId = res?.orderId || res?.id || res?.paymentId || null;

      if (!qrUrl) {
        // helpful error message
        throw new Error('QR URL missing in payment response. See console for full response object.');
      }

      // Open QR page
      const win = window.open(qrUrl, '_blank', 'width=800,height=600');
      setQrWindow(win);

      if (newOrderId) {
        setOrderId(newOrderId);
        startPollingPaymentStatus(newOrderId);
      } else {
        // No orderId -> fallback: don't poll, mark step to 'wait for user' or success screen depending on your choice
        // I recommend showing a "Complete payment in ZaloPay" screen instead of auto success
        setPaymentStatus('processing');
        setStep(2); // keep on payment step or you can set to 3 to simulate success
        // Optionally show a message instructing user to return to profile after paying
      }

    } catch (err) {
      console.error('❌ PAYMENT ERROR:', err);
      alert('Payment failed: ' + (err.message || 'See console'));
    } finally {
      setProcessing(false);
    }
  };


  // Manual check payment status (user clicks button)
  const handleManualCheck = async () => {
    if (!orderId) return;

    setProcessing(true);
    try {
      const statusResponse = await paymentService.checkPaymentStatus(orderId);

      if (
        statusResponse?.status === 'COMPLETED' ||
        statusResponse?.status === 'completed' ||
        statusResponse?.status === 'SUCCESS'
      ) {
        handlePaymentSuccess(orderId);
      } else {
        alert('⏳ Payment not yet completed. Please complete the payment in the opened window.');
      }
    } catch (error) {
      console.error('❌ Error checking status:', error);
      alert('Failed to check payment status. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white pt-24 pb-0 px-4 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3 mb-2">
            <Crown className="w-8 h-8 text-yellow-400" />
            Upgrade to Premium
          </h1>
          <p className="text-slate-400">Unlock unlimited music</p>
        </div>

        <div className="mb-8 flex items-center justify-center gap-4">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-2 ${step >= s ? 'text-cyan-400' : 'text-slate-600'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= s ? 'bg-cyan-400 text-white' : 'bg-slate-700'}`}>
                  {step > s ? <Check className="w-5 h-5" /> : s}
                </div>
                <span className="hidden sm:inline text-sm font-medium">
                  {s === 1 ? 'Choose Plan' : s === 2 ? 'Payment' : 'Complete'}
                </span>
              </div>
              {s < 3 && <div className={`w-16 h-0.5 ${step > s ? 'bg-cyan-400' : 'bg-slate-700'}`} />}
            </React.Fragment>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {loadingPlans ? (
              <div className="text-center py-20 text-slate-400">
                <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3 text-cyan-400" />
                Loading packages...
              </div>
            ) : plans.length === 0 ? (
              <div className="text-center py-20 bg-slate-800/50 rounded-2xl border border-slate-700">
                <AlertCircle className="w-10 h-10 mx-auto mb-3 text-red-400" />
                <p className="text-lg font-medium text-white mb-2">No service packages available.</p>
              </div>
            ) : (
              <>
                <div className={`grid gap-6 ${plans.length === 1 ? 'max-w-md mx-auto' : 'md:grid-cols-2'}`}>
                  {plans.map((planObj) => (
                    <div
                      key={planObj.id}
                      onClick={() => setSelectedPlan(planObj)}
                      className={`relative bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border-2 cursor-pointer transition-all hover:scale-[1.02] ${selectedPlan?.id === planObj.id
                        ? 'border-cyan-400 shadow-lg shadow-cyan-400/20 bg-slate-800'
                        : 'border-slate-700 hover:border-slate-600'
                        }`}
                    >
                      {planObj.resetInterval === 'YEARLY' && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-400 text-slate-900 px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                          BEST VALUE
                        </div>
                      )}

                      {selectedPlan?.id === planObj.id && (
                        <div className="absolute top-4 right-4 w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center shadow-md">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}

                      <div className="mb-4 text-center sm:text-left">
                        <h3 className="text-2xl font-bold mb-2 text-white">{planObj.name}</h3>
                        <div className="flex items-baseline gap-2 justify-center sm:justify-start">
                          <span className="text-4xl font-bold text-cyan-400">{planObj.price.toLocaleString()} VND</span>
                          <span className="text-slate-400 text-sm">/ {planObj.duration} days</span>
                        </div>
                      </div>

                      <ul className="space-y-3 border-t border-slate-700/50 pt-4">
                        {planObj.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                            <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => selectedPlan && setStep(2)}
                    disabled={!selectedPlan}
                    className="px-8 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full font-bold text-slate-900 hover:shadow-lg hover:shadow-cyan-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue to payment
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {step === 2 && selectedPlan && (
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-cyan-500/30 mb-6 shadow-lg shadow-cyan-500/10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-cyan-400" />
                  Order Summary
                </h3>
                <button onClick={() => setStep(1)} className="text-cyan-400 text-sm hover:text-cyan-300 transition flex items-center gap-1 hover:gap-2">
                  <span>Change plan</span> →
                </button>
              </div>

              <div className="bg-slate-900/60 rounded-xl p-5 border border-slate-700/50">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="font-bold text-2xl text-white mb-1">{selectedPlan.name}</div>
                    <div className="text-sm text-slate-400 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {selectedPlan.duration} days subscription
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500 mb-1">Total Amount</div>
                    <span className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                      {selectedPlan.price.toLocaleString()} VND
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-700/50 flex items-center justify-between text-sm">
                  <span className="text-slate-400">Price per day</span>
                  <span className="text-cyan-400 font-medium">
                    {Math.round(selectedPlan.price / selectedPlan.duration).toLocaleString()} VND
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 mb-6">
              <h3 className="text-lg font-semibold mb-4 text-white">Payment Method</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-4 rounded-xl border-2 transition-all text-left group ${paymentMethod === method.id
                        ? `border-${method.color}-400 bg-${method.color}-400/10`
                        : 'border-slate-700 hover:border-slate-600 hover:bg-white/5'
                        }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className={`w-6 h-6 text-${method.color}-400 group-hover:scale-110 transition-transform`} />
                        <span className="font-medium text-white">{method.name}</span>
                      </div>
                      <p className="text-xs text-slate-400">{method.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
              <div className="text-center py-6">
                <QrCode className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                <p className="text-slate-300 mb-2">Click "Pay Now" to open payment page</p>
                <p className="text-slate-400 text-sm">A new window will open for secure payment</p>
              </div>

              <div className="pt-6 border-t border-slate-700 mt-6">
                <div className="flex items-center gap-2 text-sm text-slate-400 mb-4 justify-center">
                  <Shield className="w-4 h-4" />
                  <span>256-bit SSL Security</span>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 px-6 py-3 border border-slate-700 rounded-lg hover:bg-slate-700 transition text-white font-medium"
                  >
                    Go Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={processing}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg font-bold text-slate-900 hover:shadow-lg hover:shadow-cyan-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-5 h-5" />
                        Pay Now {selectedPlan.price.toLocaleString()} VND
                      </>
                    )}
                  </button>
                </div>

                {processing && orderId && (
                  <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-blue-400 text-sm text-center mb-3">
                      ⏳ Waiting for payment confirmation...
                    </p>
                    <button
                      onClick={handleManualCheck}
                      className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition"
                    >
                      I've completed the payment
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 3 && selectedPlan && (
          <div className="max-w-2xl mx-auto text-center animate-in zoom-in duration-500">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 shadow-2xl">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-white">Payment Successful!</h2>
              <p className="text-slate-400 mb-8 text-lg">
                Congratulations! Your <span className="text-cyan-400 font-bold">{selectedPlan.name}</span> plan has been activated.
              </p>

              <div className="bg-slate-900/80 rounded-xl p-6 mb-8 text-left border border-slate-700">
                <div className="flex justify-between mb-3 border-b border-slate-800 pb-3">
                  <span className="text-slate-400">Transaction ID</span>
                  <span className="text-white font-mono text-sm">{orderId}</span>
                </div>
                <div className="flex justify-between mb-3">
                  <span className="text-slate-400">Amount</span>
                  <span className="text-cyan-400 font-bold text-lg">{selectedPlan.price.toLocaleString()} VND</span>
                </div>
                <div className="flex justify-between mb-3">
                  <span className="text-slate-400">Duration</span>
                  <span className="text-white">{selectedPlan.duration} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Method</span>
                  <span className="text-white capitalize">{paymentMethod}</span>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => window.location.href = '/profile'}
                  className="px-8 py-3 border border-cyan-400 text-cyan-400 rounded-full font-bold hover:bg-cyan-400/10 transition"
                >
                  View Profile
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="px-8 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full font-bold text-slate-900 hover:shadow-lg hover:shadow-cyan-500/50 transition transform hover:-translate-y-1"
                >
                  Start listening to music
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}