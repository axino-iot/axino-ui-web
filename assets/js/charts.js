function generateGraph(container,type, time, series,counter,title,size,date,conf=0,device_id=0,date_time) {
    if(size<=3){
        graph_height = "92%";
        legend_enabled = false;

    }
    else if(size>3&&size<=9){
        graph_height = "29.5%";
        legend_enabled = true;
    }
    else{
        graph_height = "";
        legend_enabled = true;
    }
    if(type == 'spline'|| type == 'column' || type == 'line'){
        all_chart[counter] = Highcharts.chart(container, {
            chart: {
                type: type,
                marginLeft: 80,
                marginRight: 70
            },
            tooltip: {
                formatter: function() {
                    if(date_time[this.x]!=undefined){
                        return '<b>Date : </b>' + date_time[this.x] + '<br><b style="color:'+ this.series.color + '">'+this.series.name+':</b>'+ this.y ;
                    }
                    else{
                        
                        now_date = new Date();
                        c_date = now_date.getDate();
                        c_month = now_date.getMonth() + 1;
                        c_year = now_date.getFullYear();

                        if (c_date < 10) {
                          c_date = '0' + c_date;
                        } 
                        if (c_month < 10) {
                          c_month = '0' + c_month;
                        } 

                        return '<b>Time : </b>'+c_year+'-'+c_month+'-'+c_date+' '+this.x+ '<br><b style="color:'+ this.series.color + '">'+this.series.name+':</b>'+ this.y ;
                    }
                }
            },
            legend: {
                enabled: legend_enabled
            },
            credits: {
                enabled: true
            },

            title: {
                text: title
            },
            subtitle: {
                text: "("+date+")"
            },
            yAxis: {
                title: {
                    text: ''
                }
            },
            xAxis: {
                categories: time
            },
            plotOptions: {
                line: {
                    dataLabels: {
                        enabled: true
                    }
                }
            },
            series: series,
            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 500
                    },
                    chartOptions: {
                        legend: {
                            layout: 'horizontal',
                            align: 'center',
                            verticalAlign: 'bottom'
                        }
                    }
                }]
            }
        }, function(chart) { // on complete

            let device_all_data = JSON.parse(localStorage.getItem('data_'+device_id));
            let data_length = device_all_data.length;
            let max = data_length;
            let min = data_length-parseInt(conf.no_of_points);
            let g_id = ((conf.graphID+"").split("."))[1];
            let g_points = parseInt(conf.no_of_points);

            function noop(){};
            left = 'left_'+g_id;
            right = 'right_'+g_id;
            
            chart.id = g_id;
            chart.device_id = device_id;
            chart.min = min;
            chart.max = max;
            chart.g_points = g_points;
            chart.conf = conf;
            chart.data_length = data_length;

            chart[left] = chart.renderer.button('<', chart.plotLeft - 75, chart.plotHeight-135 + chart.plotTop, noop).addClass('left_'+g_id).add();
            chart[right] = chart.renderer.button('>', chart.plotLeft + chart.plotWidth + 20, chart.plotHeight + chart.plotTop-135, noop).addClass('right_'+g_id).add();

            $('.left_'+g_id).click(function() {
                min = min-g_points;
                max= max-g_points;
                if(min>=0&&max<=data_length){
                    update_graph(conf,device_id,min,max);
                }
                else{
                    min = min+g_points;
                    max = max+g_points;
                }
            });
            $('.right_'+g_id).click(function() {
                min = min+g_points;
                max = max+g_points;
                if(min>=0&&max<=data_length){
                    update_graph(conf,device_id,min,max);
                }
                else{
                    min = min-g_points;
                    max= max-g_points;
                }
            });
        });
    }
    else if(type == 'gauge-speedometer-default'){
        if(size<=3){
            key_name = "";
            meter_size = "92%";
        }
        else if(size>3&&size<=9){
            key_name = series[0].name;
            meter_size = "29.5%";
        }
        else{
            key_name = series[0].name;
            meter_size = "76%";
        }
        all_chart[counter] = Highcharts.chart(container, {
            chart: {
                type: 'gauge',
                plotBackgroundColor: null,
                plotBackgroundImage: null,
                plotBorderWidth: 0,
                plotShadow: false
            },

            title: {
                text: title
            },
            credits: {
                enabled: true
            },

            pane: {
                startAngle: -150,
                endAngle: 150,
                background: [{
                    backgroundColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                        stops: [
                            [0, '#FFF'],
                            [1, '#333']
                        ]
                    },
                    borderWidth: 0,
                    outerRadius: '109%'
                }, {
                    backgroundColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                        stops: [
                            [0, '#333'],
                            [1, '#FFF']
                        ]
                    },
                    borderWidth: 1,
                    outerRadius: '107%'
                }, {
                    // default background
                }, {
                    backgroundColor: '#DDD',
                    borderWidth: 0,
                    outerRadius: '105%',
                    innerRadius: '103%'
                }]
            },

            // the value axis
            yAxis: {
                min: 0,
                max: 200,

                minorTickInterval: 'auto',
                minorTickWidth: 1,
                minorTickLength: 10,
                minorTickPosition: 'inside',
                minorTickColor: '#666',

                tickPixelInterval: 30,
                tickWidth: 2,
                tickPosition: 'inside',
                tickLength: 10,
                tickColor: '#666',
                labels: {
                    step: 2,
                    rotation: 'auto'
                },
                title: {
                    text: key_name
                },
                plotBands: [{
                    from: 0,
                    to: 120,
                    color: '#55BF3B' // green
                }, {
                    from: 120,
                    to: 160,
                    color: '#DDDF0D' // yellow
                }, {
                    from: 160,
                    to: 200,
                    color: '#DF5353' // red
                }]
            },

            series: [{
                name: series[0].name,
                data: [series[0].data.pop()],
            }]
        });
    }
    else if(type == 'gauge-solid-default'){
        if(size<=3){
            guage_font_size = "100%";
            guage_size = "92%";
        }
        else if(size>3&&size<=9){
            guage_font_size = "150%";
            guage_size = "29.5%";
        }
        else{
            guage_font_size = "200%";
            guage_size = "76%";
        }
        all_chart[counter] = Highcharts.chart(container, {
            chart: {
                type: 'solidgauge'
            },

            title: {
                    text: title
                },

            pane: {
                center: ['50%', '85%'],
                size: '100%',
                startAngle: -90,
                endAngle: 90,
                background: {
                    backgroundColor:
                        Highcharts.defaultOptions.legend.backgroundColor || '#EEE',
                    innerRadius: '60%',
                    outerRadius: '100%',
                    shape: 'arc'
                }
            },

            tooltip: {
                enabled: false
            },

            // the value axis
            yAxis: {
                min: 0,
                max: 200,
                title: {
                    text: title
                },
                stops: [
                    [0.1, '#55BF3B'], // green
                    [0.5, '#DDDF0D'], // yellow
                    [0.9, '#DF5353'] // red
                ],
                lineWidth: 0,
                tickWidth: 0,
                minorTickInterval: null,
                tickAmount: 2,
                title: {
                    y: -70
                },
                labels: {
                    y: 16
                }
            },

            plotOptions: {
                solidgauge: {
                    dataLabels: {
                        y: 5,
                        borderWidth: 0,
                        useHTML: true
                    }
                }
            },
            credits: {
                enabled: true
            },

            series: [{
                name: series[0].name,
                data: [series[0].data.pop()],
                dataLabels: {
                    format:
                        '<div style="text-align:center">' +
                        '<span style="font-size:'+guage_font_size+'">{y}</span><br/>' +
                        '<span style="font-size:12px;opacity:0.4">'+series[0].name+'</span>' +
                        '</div>'
                }
            }]
        });
    }
    else if(type=="gauge-activity-default"){
 
        if(size<=3){
            label_position = -20;
            label_size = "1em";
        }
        else if(size>3&&size<=9){
            label_position = -20;
            label_size = "2em";
        }
        else{
            label_position = 0;
            label_size = "2em";
            activity_size = "";
        }

        activity_series = [];
        pane_background = [];
        series.forEach(function ( value, i ){
            persentage_1 = ((112-(24*i))-i)+'%';
            persentage_2 = (((112-(24*i))-i)-24)+'%';
            activity_series.push({
            name: value.name,
            data: [{
                    color: Highcharts.getOptions().colors[i],
                    radius: persentage_1,
                    innerRadius: persentage_2,
                    y: value.data.pop()
                }]
            });
            pane_background.push({ // Track for Move
                outerRadius: persentage_1,
                innerRadius: persentage_2,
                backgroundColor: Highcharts.Color(Highcharts.getOptions().colors[i])
                    .setOpacity(0.3)
                    .get(),
                borderWidth: 0
            })
        });

        all_chart[counter] = Highcharts.chart(container,{

        chart: {
            type: 'solidgauge'
        },

        title: {
            text: title
        },

        tooltip: {
            borderWidth: 0,
            backgroundColor: 'none',
            shadow: false,
            valueSuffix: '',
            pointFormat: '{series.name}<br><span style="font-size:'+label_size+'; color: {point.color}; font-weight: bold">{point.y}</span>',
            positioner: function (labelWidth) {
                return {
                    x: (this.chart.chartWidth - labelWidth) / 2,
                    y: (this.chart.plotHeight / 2) + 15 + label_position
                };
            }
        },

        pane: {
            startAngle: 0,
            endAngle: 360,
            background: pane_background
        },
        credits: {
                enabled: true
            },

        yAxis: {
            min: 0,
            max: 100,
            lineWidth: 0,
            tickPositions: []
        },

        plotOptions: {
            solidgauge: {
                dataLabels: {
                    enabled: false
                },
                linecap: 'round',
                stickyTracking: false,
                rounded: true
            }
        },

        series: activity_series
    });
    }
    else if (type=="line-time-series-default") {
        all_chart[counter]=Highcharts.chart(container, {
            chart: {
                zoomType: 'x',
                marginLeft: 80,
                marginRight: 60
            },
	        credits: {
	            enabled: false
	        },
            tooltip: {
                formatter: function() {
                    if(date_time[this.x]!=undefined){
                        return '<b>Date : </b>' + date_time[this.x] + '<br><b style="color:'+ this.series.color + '">'+this.series.name+':</b>'+ this.y ;
                    }
                    else{
                        return '<b>Time : </b>' + this.x + '<br><b style="color:'+ this.series.color + '">'+this.series.name+':</b>'+ this.y ;
                    }
                }
            },
            title: {
                text: title
            },
            subtitle: {
                text: 'Click and drag in the plot area to zoom in'
            },
            xAxis: {
                categories: time
            },
            yAxis: {
                title: {
                    text: ''
                }
            },
            legend: {
                enabled: false
            },
            plotOptions: {
                area: {
                    fillColor: {
                        linearGradient: {
                            x1: 0,
                            y1: 0,
                            x2: 0,
                            y2: 1
                        },
                        stops: [
                            [0, Highcharts.getOptions().colors[0]],
                            [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                        ]
                    },
                    marker: {
                        radius: 2
                    },
                    lineWidth: 1,
                    states: {
                        hover: {
                            lineWidth: 1
                        }
                    },
                    threshold: null
                }
            },

            series: [{
                type: 'area',
                name: series[0].name,
                data: series[0].data
            }]
        }, function(chart) { // on complete

            let device_all_data = JSON.parse(localStorage.getItem('data_'+device_id));
            let data_length = device_all_data.length;
            let max = data_length;
            let min = data_length-parseInt(conf.no_of_points);
            let g_id = ((conf.graphID+"").split("."))[1];
            let g_points = parseInt(conf.no_of_points);

            function noop(){};
            chart.renderer.button('<', chart.plotLeft - 75, chart.plotHeight-135 + chart.plotTop, noop).addClass('left_'+g_id).add();
            chart.renderer.button('>', chart.plotLeft + chart.plotWidth + 20, chart.plotHeight + chart.plotTop-135, noop).addClass('right_'+g_id).add();

            chart.id = g_id;
            chart.device_id = device_id;
            chart.min = min;
            chart.max = max;
            chart.g_points = g_points;
            chart.conf = conf;
            chart.data_length = data_length;

            $('.left_'+g_id).click(function() {
                min = min-g_points;
                max= max-g_points;
                if(min>=0&&max<=data_length){
                    update_graph(conf,device_id,min,max);
                }
                else{
                    min = min+g_points;
                    max = max+g_points;
                }
            });
            $('.right_'+g_id).click(function() {
                min = min+g_points;
                max = max+g_points;
                if(min>=0&&max<=data_length){
                    update_graph(conf,device_id,min,max);
                }
                else{
                    min = min-g_points;
                    max= max-g_points;
                }
            });
        });
    }
    else{
        console.log(type);
    }
    
    // Highcharts.charts.forEach((chart,i)=>{
    //     if(chart!=undefined){
    //         chart.reflow()
    //     }
    //     else{
    //          Highcharts.charts.splice(i);
    //     }
    // });
    
}