import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChartService {
  
  /**
   * Format data for bar charts
   */
  formatBarChartData(data: any[], xField: string, yField: string, labelField?: string): any[] {
    return data.map(item => ({
      name: item[xField]?.toString() || '',
      value: Number(item[yField]) || 0,
      label: labelField ? (item[labelField]?.toString() || '') : undefined
    }));
  }
  
  /**
   * Format data for line charts
   */
  formatLineChartData(data: any[], 
                      xField: string, 
                      yField: string, 
                      seriesName: string = 'Series'): any[] {
    return [
      {
        name: seriesName,
        series: data.map(item => ({
          name: item[xField]?.toString() || '',
          value: Number(item[yField]) || 0
        }))
      }
    ];
  }
  
  /**
   * Format data for multi-series line charts
   */
  formatMultiLineChartData(data: any[], 
                          xField: string, 
                          yField: string, 
                          seriesField: string): any[] {
    
    // Group by series field
    const seriesMap = new Map();
    
    data.forEach(item => {
      const seriesName = item[seriesField]?.toString() || 'Unknown';
      if (!seriesMap.has(seriesName)) {
        seriesMap.set(seriesName, []);
      }
      
      seriesMap.get(seriesName).push({
        name: item[xField]?.toString() || '',
        value: Number(item[yField]) || 0
      });
    });
    
    // Convert map to array
    const result = [];
    seriesMap.forEach((dataPoints, seriesName) => {
      result.push({
        name: seriesName,
        series: dataPoints
      });
    });
    
    return result;
  }
  
  /**
   * Format data for pie charts
   */
  formatPieChartData(data: any[], nameField: string, valueField: string): any[] {
    return data.map(item => ({
      name: item[nameField]?.toString() || 'Unknown',
      value: Number(item[valueField]) || 0
    }));
  }
}
