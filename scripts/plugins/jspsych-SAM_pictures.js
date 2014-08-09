/**
 * jspsych-SAM_pictures
 * a jspsych plugin for measuring items on a likert scale
 *
 * Josh de Leeuw 
 * 
 * documentation: https://github.com/jodeleeuw/jsPsych/wiki/jspsych-SAM_pictures
 *
 */

(function($) {
    jsPsych['SAM_pictures'] = (function() {

        var plugin = {};

        plugin.create = function(params) {
            
            params = jsPsych.pluginAPI.enforceArray(params, ['stimuli', 'data']);
            
            var trials = new Array(params.stimuli.length);
            for (var i = 0; i < trials.length; i++) {
                trials[i] = {};
                trials[i].type =  "SAM_pictures",
                trials[i].questions =  params.questions[i],
                trials[i].a_path = params.stimuli[i];
                trials[i].labels =  params.labels[i],
                trials[i].intervals =  params.intervals[i],
                trials[i].show_ticks =  (typeof params.show_ticks === 'undefined') ? true : params.show_ticks,
                trials[i].data =  (typeof params.data === 'undefined') ? {} : params.data[i]
            }
            return trials;
        };

        plugin.trial = function(display_element, block, trial, part) {
            
            // if any trial variables are functions
            // this evaluates the function and replaces
            // it with the output of the function
            trial = jsPsych.pluginAPI.normalizeTrialVariables(trial);


            if (!trial.is_html) {
                display_element.append($('<img>', {
                    src: trial.a_path,
                    id: 'jspsych-single-stim-stimulus'
                }));
            }
            else {
                display_element.append($('<div>', {
                    html: trial.a_path,
                    id: 'jspsych-single-stim-stimulus'
                }));
            }
	    


            // add likert scale questions
            for (var i = 0; i < trial.questions.length; i++) {
                // create div
                display_element.append($('<div>', {
                    "id": 'jspsych-SAM_pictures-' + i,
                    "class": 'jspsych-SAM_pictures-question'
                }));

                // add question text
                $("#jspsych-SAM_pictures-" + i).append('<p class="jspsych-SAM_pictures-text SAM_pictures">' + trial.questions[i] + '</p>');

                // create slider
                $("#jspsych-SAM_pictures-" + i).append($('<div>', {
                    "id": 'jspsych-SAM_pictures-slider-' + i,
                    "class": 'jspsych-SAM_pictures-slider jspsych-SAM_pictures'
                }));
                $("#jspsych-SAM_pictures-slider-" + i).slider({
                    value: Math.ceil(trial.intervals[i] / 2),
                    min: 1,
                    max: trial.intervals[i],
                    step: 1
                });

                // show tick marks
                if (trial.show_ticks) {
                    $("#jspsych-SAM_pictures-" + i).append($('<div>', {
                        "id": 'jspsych-SAM_pictures-sliderticks' + i,
                        "class": 'jspsych-SAM_pictures-sliderticks jspsych-SAM_pictures',
                        "css": {
                            "position": 'relative'
                        }
                    }));
                    for (var j = 1; j < trial.intervals[i] - 1; j++) {
                        $('#jspsych-SAM_pictures-slider-' + i).append('<div class="jspsych-SAM_pictures-slidertickmark"></div>');
                    }

                    $('#jspsych-SAM_pictures-slider-' + i + ' .jspsych-SAM_pictures-slidertickmark').each(function(index) {
                        var left = (index + 1) * (100 / (trial.intervals[i] - 1));
                        $(this).css({
                            'position': 'absolute',
                            'left': left + '%',
                            'width': '1px',
                            'height': '100%',
                            'background-color': '#222222'
                        });
                    });
                }

                // create labels for slider
                $("#jspsych-SAM_pictures-" + i).append($('<ul>', {
                    "id": "jspsych-SAM_pictures-sliderlabels-" + i,
                    "class": 'jspsych-SAM_pictures-sliderlabels SAM_pictures',
                    "css": {
                        "width": "100%",
                        "margin": "10px 0px 0px 0px",
                        "padding": "0px",
                        "display": "block",
                        "position": "relative"
                    }
                }));

                for (var j = 0; j < trial.labels[i].length; j++) {
                    $("#jspsych-SAM_pictures-sliderlabels-" + i).append('<li>' + trial.labels[i][j] + '</li>');
                }

                // position labels to match slider intervals
                var slider_width = $("#jspsych-SAM_pictures-slider-" + i).width();
                var num_items = trial.labels[i].length;
                var item_width = slider_width / num_items;
                var spacing_interval = slider_width / (num_items - 1);

                $("#jspsych-SAM_pictures-sliderlabels-" + i + " li").each(function(index) {
                    $(this).css({
                        'display': 'inline-block',
                        'width': item_width + 'px',
                        'margin': '0px',
                        'padding': '0px',
                        'text-align': 'center',
                        'position': 'absolute',
                        'left': (spacing_interval * index) - (item_width / 2)
                    });
                });
            }

            // add submit button
            display_element.append($('<button>', {
                'id': 'jspsych-SAM_pictures-next',
                'class': 'jspsych-SAM_pictures'
            }));
            $("#jspsych-SAM_pictures-next").html('Submit Answers');
            $("#jspsych-SAM_pictures-next").click(function() {
                // measure response time
                var endTime = (new Date()).getTime();
                var response_time = endTime - startTime;

                // create object to hold responses
                var question_data = {};
                $("div.jspsych-SAM_pictures-slider").each(function(index) {
                    var id = "Q" + index;
                    var val = $(this).slider("value");
                    var obje = {};
                    obje[id] = val;
                    $.extend(question_data, obje);
                });

                // save data
                block.writeData($.extend({}, {
                    "trial_type": "SAM_pictures",
                    "trial_index": block.trial_idx,
                    "rt": response_time
                }, question_data, trial.data));

                display_element.html('');

                // next trial
                block.next();
            });

            var startTime = (new Date()).getTime();
        };

        return plugin;
    })();
})(jQuery);
