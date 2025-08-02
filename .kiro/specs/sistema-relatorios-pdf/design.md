# Design Document

## Overview

O sistema de relatórios em PDF será implementado como um módulo integrado ao IgrejaConnect, utilizando as bibliotecas jsPDF e html2canvas para geração de documentos, e xlsx para exportação de planilhas. O sistema seguirá o padrão arquitetural existente com APIs REST no backend e interface React no frontend.

## Architecture

### Frontend Architecture
```
src/react-app/pages/Reports.tsx
├── ReportFilters.tsx (componente de filtros)
├── ReportPreview.tsx (preview do relatório)
├── PDFGenerator.tsx (geração de PDF)
└── ExcelExporter.tsx (exportação Excel)

src/react-app/components/reports/
├── MemberReportTemplate.tsx
├── FinancialReportTemplate.tsx
├── DepartmentReportTemplate.tsx
└── ReportHeader.tsx (cabeçalho padrão)
```

### Backend Architecture
```
src/worker/routes/reports.ts
├── GET /api/reports/members
├── GET /api/reports/financial
├── GET /api/reports/departments
└── GET /api/reports/settings

src/worker/services/
├── ReportService.ts (lógica de negócio)
├── PDFTemplateService.ts (templates)
└── DataAggregationService.ts (agregação de dados)
```

### Database Schema
```sql
-- Tabela para configurações de relatórios
CREATE TABLE report_settings (
  id SERIAL PRIMARY KEY,
  church_id INTEGER NOT NULL,
  logo_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#3B82F6',
  secondary_color VARCHAR(7) DEFAULT '#1E40AF',
  church_name VARCHAR(200),
  church_address TEXT,
  church_phone VARCHAR(20),
  church_email VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Components and Interfaces

### 1. ReportFilters Component
```typescript
interface ReportFilters {
  reportType: 'members' | 'financial' | 'departments';
  dateRange: {
    startDate: string;
    endDate: string;
  };
  filters: {
    memberStatus?: 'active' | 'inactive' | 'all';
    departmentIds?: number[];
    ageRange?: { min: number; max: number };
    transactionType?: 'income' | 'expense' | 'all';
    categories?: string[];
  };
}
```

### 2. PDFGenerator Service
```typescript
interface PDFGeneratorOptions {
  template: 'member' | 'financial' | 'department';
  data: any[];
  settings: ReportSettings;
  filters: ReportFilters;
}

class PDFGenerator {
  async generatePDF(options: PDFGeneratorOptions): Promise<Blob>;
  private createHeader(doc: jsPDF, settings: ReportSettings): void;
  private createFooter(doc: jsPDF, pageNumber: number, totalPages: number): void;
  private addLogo(doc: jsPDF, logoUrl: string): Promise<void>;
}
```

### 3. Report Templates
```typescript
interface ReportTemplate {
  title: string;
  generateContent(data: any[], doc: jsPDF): void;
  calculateMetrics(data: any[]): ReportMetrics;
}

interface ReportMetrics {
  totalCount: number;
  summary: Record<string, any>;
  charts?: ChartData[];
}
```

## Data Models

### ReportSettings Model
```typescript
interface ReportSettings {
  id: number;
  churchId: number;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  churchName?: string;
  churchAddress?: string;
  churchPhone?: string;
  churchEmail?: string;
  createdAt: string;
  updatedAt: string;
}
```

### ReportData Models
```typescript
interface MemberReportData {
  id: number;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  baptismDate?: string;
  status: string;
  department?: string;
  address?: string;
}

interface FinancialReportData {
  id: number;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  createdBy: string;
}

interface DepartmentReportData {
  id: number;
  name: string;
  category: string;
  leaders: string[];
  memberCount: number;
  nextMeeting?: string;
  isActive: boolean;
  upcomingEvents: EventData[];
}
```

## Error Handling

### PDF Generation Errors
```typescript
enum PDFError {
  TEMPLATE_NOT_FOUND = 'TEMPLATE_NOT_FOUND',
  DATA_PROCESSING_ERROR = 'DATA_PROCESSING_ERROR',
  LOGO_LOAD_ERROR = 'LOGO_LOAD_ERROR',
  MEMORY_LIMIT_EXCEEDED = 'MEMORY_LIMIT_EXCEEDED'
}

class PDFGenerationError extends Error {
  constructor(
    public code: PDFError,
    message: string,
    public details?: any
  ) {
    super(message);
  }
}
```

### Error Recovery Strategies
1. **Logo Load Failure**: Continue without logo, show warning
2. **Large Dataset**: Implement pagination and chunking
3. **Memory Issues**: Process data in batches
4. **Network Errors**: Retry mechanism with exponential backoff

## Testing Strategy

### Unit Tests
```typescript
// PDFGenerator.test.ts
describe('PDFGenerator', () => {
  test('should generate member report PDF', async () => {
    const generator = new PDFGenerator();
    const options = createMockOptions('member');
    const pdf = await generator.generatePDF(options);
    expect(pdf).toBeInstanceOf(Blob);
    expect(pdf.type).toBe('application/pdf');
  });

  test('should handle missing logo gracefully', async () => {
    const options = createMockOptionsWithInvalidLogo();
    const pdf = await generator.generatePDF(options);
    expect(pdf).toBeInstanceOf(Blob);
  });
});
```

### Integration Tests
```typescript
// Reports API Tests
describe('Reports API', () => {
  test('GET /api/reports/members should return filtered data', async () => {
    const response = await request(app)
      .get('/api/reports/members')
      .query({ status: 'active', departmentId: 1 });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toBeInstanceOf(Array);
  });
});
```

### Performance Tests
- Test PDF generation with 1000+ members
- Measure memory usage during large report generation
- Test concurrent report generation requests
- Validate Excel export performance

## Implementation Phases

### Phase 1: Core Infrastructure (Week 1)
1. Create report settings table and API
2. Implement basic PDF generation service
3. Create report page with basic UI
4. Add member report template

### Phase 2: Financial Reports (Week 1)
1. Implement financial data aggregation
2. Create financial report template with charts
3. Add date range filtering
4. Implement Excel export for financial data

### Phase 3: Department Reports (Week 2)
1. Create department report template
2. Integrate with events data
3. Add department-specific filtering
4. Implement batch processing for multiple departments

### Phase 4: Customization & Polish (Week 2)
1. Implement report settings page
2. Add logo upload functionality
3. Create color customization
4. Add report preview functionality
5. Optimize performance and add caching

## Security Considerations

### Access Control
- Only authenticated users can generate reports
- Role-based access: Admin (all reports), Treasurer (financial), Leaders (own department)
- Audit logging for report generation

### Data Privacy
- Sensitive data filtering based on user permissions
- No storage of generated PDFs on server
- Secure logo upload with file type validation

### Performance Limits
- Maximum 5000 records per report
- Rate limiting: 10 reports per user per hour
- Memory limits for PDF generation

## Monitoring and Analytics

### Metrics to Track
- Report generation frequency by type
- Average generation time
- Error rates and types
- Most used filters and date ranges
- User adoption by role

### Logging Strategy
```typescript
interface ReportLog {
  userId: number;
  reportType: string;
  filters: ReportFilters;
  recordCount: number;
  generationTime: number;
  success: boolean;
  error?: string;
  timestamp: string;
}
```