import Ember from 'ember';
import ChartDataUpdater from 'ember-cli-chart/chart-data-updater';
/* global Chart */

export default Ember.Component.extend({
  tagName: 'canvas',
  attributeBindings: ['width', 'height'],

  // eligRedraw: function(){
  //   Ember.run.next(this, function(){ //run next so that it can resize according to all the changes to the divs
  //     this.get('chart').resize().render(); 
  //   });
  // }.observes('data'),

  // navRedraw: function(){
  //   this.willDestroyElement();
  //   var newWidth = this.$().parent().width();
  //   this.$().prop({
  //     'width': newWidth
  //   });
  //   this.renderChart(false); //don't reanimate when you're redrawing the chart when the navbar opens
  // }.observes('navIsOpen'),

  didInsertElement: function(){
    var context = this.get('element').getContext('2d');
    var data = this.get('data');
    var type = Ember.String.classify(this.get('type'));
    var options = Ember.merge({}, this.get('options'));

    var chart = new Chart(context)[type](data, options);

    if (this.get('legend')) {
      var legend = chart.generateLegend();
      this.$().wrap("<div class='chart-parent'></div>");
      this.$().parent().append(legend);
    }

    this.set('chart', chart);
    this.addObserver('data', this, this.updateChart);
    this.addObserver('options', this, this.updateChart);
    this.addObserver('data.[]', this, this.updateChart);
    this.addObserver('data.labels.[]', this, this.updateChart);
    this.addObserver('data.@each.value', this, this.updateChart);
    this.addObserver('data.datasets.@each.data', this, this.updateChart);
  },

  willDestroyElement: function(){
    if (this.get('legend')) {
      this.$().parent().children('[class$=legend]').remove();
    }

    this.get('chart').destroy();
    this.removeObserver('data', this, this.updateChart);
    this.removeObserver('options', this, this.updateChart);
    this.removeObserver('data.[]', this, this.updateChart);
    this.removeObserver('data.labels.[]', this, this.updateChart);
    this.removeObserver('data.@each.value', this, this.updateChart);
    this.removeObserver('data.datasets.@each.data', this, this.updateChart);
  },

  updateChart: function(){
    var chart = this.get('chart');
    var data = this.get('data');
    var redraw = ChartDataUpdater.create({
      data: data,
      chart: chart
    }).updateByType();

    if (redraw) {
      this.willDestroyElement();
      this.didInsertElement();
    } else {
      chart.update();
    }
    
    if (this.get('legend')) {
      this.$().parent().children('[class$=legend]').remove();
      var legend = chart.generateLegend();
      this.$().parent().append(legend);
    }
  }
});
