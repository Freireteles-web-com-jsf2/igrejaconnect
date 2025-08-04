import { useState, useEffect } from 'react';
import Layout from '@/react-app/components/Layout';
import PermissionGuard from '@/react-app/components/PermissionGuard';
import { Bell, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { PermissionModule, PermissionAction } from '@/shared/permissions';

export default function NotificationsDebug() {
  const [debugStep, setDebugStep] = useState(1);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [hasError, setHasError] = useState(false);

  const addDebugInfo = (info: string) => {
    console.log('DEBUG:', info);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`]);
  };

  useEffect(() => {
    addDebugInfo('NotificationsDebug: Component mounted');

    // Test basic functionality
    const timer = setTimeout(() => {
      addDebugInfo('NotificationsDebug: Timer executed successfully');
    }, 1000);

    return () => {
      clearTimeout(timer);
      addDebugInfo('NotificationsDebug: Component unmounted');
    };
  }, []);

  const testStep = async (step: number) => {
    try {
      setHasError(false);
      addDebugInfo(`Testing step ${step}...`);

      switch (step) {
        case 1:
          addDebugInfo('Step 1: Basic React state - OK');
          break;

        case 2:
          addDebugInfo('Step 2: Testing useSupabaseAuth import...');
          await import('@/react-app/hooks/useSupabaseAuth');
          addDebugInfo('Step 2: useSupabaseAuth imported successfully');
          break;

        case 3:
          addDebugInfo('Step 3: Testing NotificationContext import...');
          await import('@/react-app/contexts/NotificationContext');
          addDebugInfo('Step 3: NotificationContext imported successfully');
          break;

        case 4:
          addDebugInfo('Step 4: Testing useNotifications hook import...');
          await import('@/react-app/hooks/useNotifications');
          addDebugInfo('Step 4: useNotifications imported successfully');
          break;

        case 5:
          addDebugInfo('Step 5: Testing useApi hook import...');
          await import('@/react-app/hooks/useApi');
          addDebugInfo('Step 5: useApi imported successfully');
          break;

        default:
          addDebugInfo(`Step ${step}: Unknown step`);
      }

      setDebugStep(step + 1);
    } catch (error) {
      setHasError(true);
      addDebugInfo(`ERROR in step ${step}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error(`Error in step ${step}:`, error);
    }
  };

  return (
    <PermissionGuard module={PermissionModule.NOTIFICATIONS} action={PermissionAction.VIEW}>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Bell className="w-7 h-7 mr-3 text-purple-600" />
              Notificações - Debug Mode
            </h1>
            <p className="text-gray-600 mt-1">
              Testando componentes progressivamente para identificar o problema
            </p>
          </div>

          {/* Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <p className={`text-2xl font-bold ${hasError ? 'text-red-600' : 'text-green-600'}`}>
                    {hasError ? 'ERROR' : 'OK'}
                  </p>
                </div>
                {hasError ? (
                  <XCircle className="w-8 h-8 text-red-600" />
                ) : (
                  <CheckCircle className="w-8 h-8 text-green-600" />
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Step</p>
                  <p className="text-2xl font-bold text-blue-600">{debugStep}</p>
                </div>
                <Bell className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Debug Logs</p>
                  <p className="text-2xl font-bold text-purple-600">{debugInfo.length}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Test Controls */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Controls</h3>
            <div className="flex flex-wrap gap-3">
              {[1, 2, 3, 4, 5].map(step => (
                <button
                  key={step}
                  onClick={() => testStep(step)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${debugStep > step
                    ? 'bg-green-100 text-green-800 border border-green-300'
                    : debugStep === step
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  disabled={debugStep > step}
                >
                  {debugStep > step ? '✓' : ''} Step {step}
                </button>
              ))}
            </div>

            <div className="mt-4">
              <button
                onClick={() => {
                  setDebugInfo([]);
                  setDebugStep(1);
                  setHasError(false);
                  addDebugInfo('Debug reset');
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Reset Debug
              </button>
            </div>
          </div>

          {/* Debug Log */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Debug Log</h3>
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
              {debugInfo.length === 0 ? (
                <p className="text-gray-500 text-sm">No debug information yet...</p>
              ) : (
                <div className="space-y-1">
                  {debugInfo.map((info, index) => (
                    <div
                      key={index}
                      className={`text-sm font-mono ${info.includes('ERROR')
                        ? 'text-red-600'
                        : info.includes('OK') || info.includes('successfully')
                          ? 'text-green-600'
                          : 'text-gray-700'
                        }`}
                    >
                      {info}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Step Descriptions */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Steps</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <span>Basic React state and effects</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <span>Import useSupabaseAuth hook</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <span>Import NotificationContext</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                <span>Import useNotifications hook</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold">5</span>
                <span>Import useApi hook</span>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </PermissionGuard>
  );
}