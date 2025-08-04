import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { DEFAULT_ROLE_PERMISSIONS } from '@/shared/permissions';

interface ValidationResult {
    isValid: boolean;
    warnings: string[];
    errors: string[];
    suggestions: string[];
}

interface UserPermissionValidationProps {
    selectedRole: string;
    userPermissions: string[];
    onValidationChange: (result: ValidationResult) => void;
}

export default function UserPermissionValidation({
    selectedRole,
    userPermissions,
    onValidationChange
}: UserPermissionValidationProps) {
    const [validationResult, setValidationResult] = useState<ValidationResult>({
        isValid: true,
        warnings: [],
        errors: [],
        suggestions: []
    });

    useEffect(() => {
        const warnings: string[] = [];
        const errors: string[] = [];
        const suggestions: string[] = [];

        try {
            // Verificar permissões padrão do papel
            const defaultPermissions = DEFAULT_ROLE_PERMISSIONS[selectedRole as keyof typeof DEFAULT_ROLE_PERMISSIONS] || [];

            // Permissões em falta
            const missingPermissions = defaultPermissions.filter(p => !userPermissions.includes(p));
            if (missingPermissions.length > 0) {
                warnings.push(`Faltam ${missingPermissions.length} permissões padrão para o papel ${selectedRole}`);
            }

            // Permissões extras
            const extraPermissions = userPermissions.filter(p => !defaultPermissions.includes(p));
            if (extraPermissions.length > 0) {
                warnings.push(`Usuário possui ${extraPermissions.length} permissões além do padrão`);
            }

            // Validações específicas por papel
            if (selectedRole === 'Tesoureiro') {
                const hasFinancialView = userPermissions.includes('financial.view');
                const hasFinancialEdit = userPermissions.includes('financial.edit');

                if (!hasFinancialView) {
                    errors.push('Tesoureiro deve ter permissão para visualizar dados financeiros');
                }
                if (!hasFinancialEdit) {
                    warnings.push('Tesoureiro geralmente precisa editar dados financeiros');
                }
            }

            if (selectedRole === 'Administrador') {
                const hasUserManagement = userPermissions.includes('users.permissions');
                if (!hasUserManagement) {
                    errors.push('Administrador deve ter permissão para gerenciar usuários');
                }
            }

            // Verificar conflitos de segurança
            if (selectedRole === 'Membro' && userPermissions.some(p => p.includes('delete'))) {
                warnings.push('Membros com permissões de exclusão podem representar risco de segurança');
            }

            // Sugestões
            if (selectedRole === 'Líder' && !userPermissions.includes('members.create')) {
                suggestions.push('Líderes geralmente precisam cadastrar novos membros');
            }
        } catch (error) {
            console.error('Erro na validação de permissões:', error);
            errors.push('Erro interno na validação de permissões');
        }

        const result: ValidationResult = {
            isValid: errors.length === 0,
            warnings,
            errors,
            suggestions
        };

        setValidationResult(result);
        onValidationChange(result);
    }, [selectedRole, userPermissions, onValidationChange]);

    if (validationResult.errors.length === 0 &&
        validationResult.warnings.length === 0 &&
        validationResult.suggestions.length === 0) {
        return null;
    }

    return (
        <div className="space-y-3 mb-6">
            {/* Erros */}
            {validationResult.errors.map((error, index) => (
                <div key={`error-${index}`} className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-red-800">Erro</p>
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                </div>
            ))}

            {/* Avisos */}
            {validationResult.warnings.map((warning, index) => (
                <div key={`warning-${index}`} className="flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-yellow-800">Aviso</p>
                        <p className="text-sm text-yellow-700">{warning}</p>
                    </div>
                </div>
            ))}

            {/* Sugestões */}
            {validationResult.suggestions.map((suggestion, index) => (
                <div key={`suggestion-${index}`} className="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-blue-800">Sugestão</p>
                        <p className="text-sm text-blue-700">{suggestion}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}