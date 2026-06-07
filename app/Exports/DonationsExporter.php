<?php

namespace App\Exports;

use App\Models\Donation;
use Illuminate\Database\Eloquent\Builder;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DonationsExporter
{
    /** @param Builder<Donation> $query */
    public function export(Builder $query, string $locale = 'ar'): StreamedResponse
    {
        $donations = $query->with('project')->latest()->get();
        $headers = $this->headers($locale);

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle($locale === 'ar' ? 'التبرعات' : 'Donations');

        $columnLetters = range('A', 'I');
        foreach ($headers as $index => $header) {
            $cell = $columnLetters[$index].'1';
            $sheet->setCellValue($cell, $header);
            $sheet->getStyle($cell)->getFont()->setBold(true);
            $sheet->getStyle($cell)->getFill()
                ->setFillType(Fill::FILL_SOLID)
                ->getStartColor()->setARGB('FFE2E8F0');
        }

        $row = 2;
        foreach ($donations as $donation) {
            $sheet->setCellValue("A{$row}", (string) $donation->reference);
            $sheet->setCellValue("B{$row}", (float) $donation->amount);
            $sheet->setCellValue("C{$row}", $donation->project?->currency ?? 'OMR');
            $sheet->setCellValue("D{$row}", $donation->phone);
            $sheet->setCellValue("E{$row}", $donation->donor_name ?? '');
            $sheet->setCellValue("F{$row}", $donation->status->value);
            $sheet->setCellValue("G{$row}", $donation->payment_method);
            $sheet->setCellValue("H{$row}", $this->projectTitle($donation, $locale));
            $sheet->setCellValue("I{$row}", $donation->created_at?->format('Y-m-d H:i:s') ?? '');
            $row++;
        }

        foreach ($columnLetters as $letter) {
            $sheet->getColumnDimension($letter)->setAutoSize(true);
        }

        $filename = 'donations-report-'.now()->format('Y-m-d-His').'.xlsx';

        return response()->streamDownload(function () use ($spreadsheet): void {
            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    /** @return list<string> */
    private function headers(string $locale): array
    {
        if ($locale === 'en') {
            return [
                'Reference',
                'Amount',
                'Currency',
                'Phone',
                'Donor Name',
                'Status',
                'Payment Method',
                'Project',
                'Date',
            ];
        }

        return [
            'المرجع',
            'المبلغ',
            'العملة',
            'الهاتف',
            'اسم المتبرع',
            'الحالة',
            'طريقة الدفع',
            'المشروع',
            'التاريخ',
        ];
    }

    private function projectTitle(Donation $donation, string $locale): string
    {
        $project = $donation->project;

        if (! $project) {
            return '';
        }

        return $locale === 'en'
            ? ($project->title_en ?: $project->title_ar)
            : ($project->title_ar ?: $project->title_en);
    }
}
