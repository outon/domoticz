define(['app'], function (app) {
    app.component('deviceLevelChart', {
        bindings: {
            log: '<'
        },
        template: '<div></div>',
        controller: DeviceLevelChartController
    });

    function DeviceLevelChartController($element) {
        this.$onChanges = function (changes) {
            if (changes.log && changes.log.currentValue) {
                renderChart(changes.log.currentValue)
            }
        };

        function renderChart(data) {
            var chartData = [];

            data.forEach(function (item) {
                var level = -1;

                if (['Off', 'Disarm', 'No Motion', 'Normal'].includes(item.Status)) {
                    level = 0;
                } else if (data.HaveSelector === true) {
                    level = parseInt(item.Level);
                } else if (item.Status.indexOf('Set Level:') === 0) {
                    var lstr = item.Status.substr(11);
                    var idx = lstr.indexOf('%');

                    if (idx !== -1) {
                        lstr = lstr.substr(0, idx - 1);
                        level = parseInt(lstr);
                    }
                } else {
                    var idx = item.Status.indexOf('Level: ');

                    if (idx !== -1) {
                        var lstr = item.Status.substr(idx + 7);
                        var idx = lstr.indexOf('%');
                        if (idx !== -1) {
                            lstr = lstr.substr(0, idx - 1);
                            level = parseInt(lstr);
                            if (level > 100) {
                                level = 100;
                            }
                        }
                    } else if (item.Level > 0 && item.Level <= 100) {
                        level = item.Level;
                    } else {
                        level = 100;
                    }
                }

                if (level !== -1) {
                    chartData.push([Date.parse(item.Date), level]);
                }
            });

            $element.highcharts({
                chart: {
                    type: 'line',
                    zoomType: 'x',
                    resetZoomButton: {
                        position: {
                            x: -30,
                            y: 10
                        }
                    },
                    marginRight: 10
                },
                title: {
                    text: null
                },
                xAxis: {
                    type: 'datetime'
                },
                yAxis: {
                    max: 100,
                    title: {
                        text: $.t('Percentage') + ' (%)'
                    }
                },
                tooltip: {
                    formatter: function () {
                        return '' +
                            $.t(Highcharts.dateFormat('%A', this.x)) + '<br/>' + Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + ', ' + this.y + ' %';
                    }
                },
                plotOptions: {
                    line: {
                        lineWidth: 3,
                        states: {
                            hover: {
                                lineWidth: 3
                            }
                        },
                        marker: {
                            enabled: false,
                            states: {
                                hover: {
                                    enabled: true,
                                    symbol: 'circle',
                                    radius: 5,
                                    lineWidth: 1
                                }
                            }
                        }
                    }
                },
                series: [{
                    id: 'percent',
                    showInLegend: false,
                    name: 'percent',
                    step: 'left',
                    data: chartData
                }],
                navigation: {
                    menuItemStyle: {
                        fontSize: '10px'
                    }
                }
            });
        }
    }
});
