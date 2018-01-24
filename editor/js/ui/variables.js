/** 
 *  Copyright Telligro Pte Ltd 2017
 *  
 *  This file is part of OPAL.
 * 
 *  OPAL is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 * 
 *  OPAL is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 * 
 *  You should have received a copy of the GNU General Public License
 *  along with OPAL.  If not, see <http://www.gnu.org/licenses/>.
 */

RED.variables = (function() {

    var trayWidth = 700;
    var variablesVisible = false;

    var panes = [];

    function addPane(options) {
        panes.push(options);
    }

    function show(initialTab) {
        if (variablesVisible) {
            return;
        }
        variablesVisible = true;
        var tabContainer;

        var trayOptions = {
            title: "Variables",
            buttons: [
                {
                    id: "node-dialog-ok",
                    text: RED._("common.label.close"),
                    class: "primary",
                    click: function() {
                        RED.tray.close();
                    }
                }
            ],
            resize: function(dimensions) {
                trayWidth = dimensions.width;
            },
            open: function(tray) {
                var trayBody = tray.find('.editor-tray-body');
                var variablesContent = $('<div></div>').appendTo(trayBody);
                var tabContainer = $('<div></div>',{id:"variables-tabs-container"}).appendTo(variablesContent);

                $('<ul></ul>',{id:"variables-tabs"}).appendTo(tabContainer);
                var variablesTabs = RED.tabs.create({
                    id: "variables-tabs",
                    vertical: true,
                    onchange: function(tab) {
                        setTimeout(function() {
                            createViewPane(tab);
                            $("#variables-tabs-content").children().hide();
                            $("#" + tab.id).show();
                            if (tab.pane.focus) {
                                tab.pane.focus();
                            }
                        },50);
                    }
                });
                var tabContents = $('<div></div>',{id:"variables-tabs-content"}).appendTo(variablesContent);

                panes.forEach(function(pane) {
                    variablesTabs.addTab({
                        id: "variables-tab-"+pane.id,
                        label: pane.title,
                        pane: pane
                    });
                    pane.get(variablesTabs).hide().appendTo(tabContents);
                });
                variablesContent.i18n();
                variablesTabs.activateTab("variables-tab-"+(initialTab||'add'))
                $("#sidebar-shade").show();
            },
            close: function() {
                variablesVisible = false;
                panes.forEach(function(pane) {
                    if (pane.close) {
                        pane.close();
                    }
                });
                $("#sidebar-shade").hide();

            },
            show: function() {}
        }
        if (trayWidth !== null) {
            trayOptions.width = trayWidth;
        }
        RED.tray.show(trayOptions);
    }

    var allSettings = {};

    function createViewPane(tabObject) {

        var pane = $('<div id="variables-tab-view" class="node-help"></div>');

        $('<h3></h3>').text("Existing Variables").appendTo(pane);
        var row = $('<div class="variables-row"></div>').appendTo(pane);
        refreshVariableList();
        // if (RED.variables.variables.length == 0) {
        //     $('<div class="variable-row-content">No Variables Found</div>').appendTo(row);
        // }
        // else {
        //   RED.variables.variables.forEach( function(variable) {
        //     console.log("Here");
        //     var variableName = variable.uiName;
        //     var variableInUse = variable.inUse;
        //     var variableDiv = $('<div class="variable-row-content"></div>').text(variableName).appendTo(row);
        //     console.log(variableDiv);
        //     var variableRemoveButton = $('<button type="button" id="variables-remove-button" class="primary ui-button ui-button-text-only ui-state-default"><span class="ui-button-text">Add Variable</span></button>').appendTo(variableDiv);
        //     variableRemoveButton.click( function(e) {
        //       e.preventDefault();
        //       var variableToBeDeleted = variableRemoveButton.parent().text();
        //       RED.variables.variables = RED.variables.variables.filter( function(variable) {
        //         return (variable.uiName != variableToBeDeleted);
        //       });
        //       refreshVariableList();
        //     });
        //   });
        // }
        return pane;
    }

    function refreshVariableList() {
      var row = $('.variables-row');
      // Delete existing elements
      $.getJSON("projects/variables", function(data) {
        RED.variables.variables = data.variables;
        $('.variable-row-content').remove();
        if (RED.variables.variables.length == 0) {
            $('<div class="variable-row-content">No Variables Found</div>').appendTo(row);
        }
        else {
          RED.variables.variables.forEach( function(variable) {
            if (variable.flowID == null || variable.flowID == window.location.hash.substring(6)) {
              var variableName = (variable.flowID == null) ? "global." + variable.uiName : "flow." + variable.uiName;
              var variableDiv = $('<div class="variable-row-content"></div>').text(variableName).appendTo(row);
              if (!variable.exists) {
                var variableRemoveButton = $('<button type="button" id="variables-remove-button" class="primary ui-button ui-button-text-only ui-state-default"><span class="ui-button-text">Remove Variable</span></button>').appendTo(variableDiv);
                variableRemoveButton.click( function(e) {
                  e.preventDefault();
                  var variableToBeDeleted = variable.name
                  RED.variables.variables = RED.variables.variables.filter( function(variable) {
                    return (variable.name != variableToBeDeleted);
                  });
                  updateVariableFile(RED.variables.variables).done(function (){
                    refreshVariableList();
                    RED.notify("Variable removed Successfully");
                  }).fail(function(err) {
                    console.log('err', err);
                    RED.notify("Updating variable file failed!");
                  });
                });
              }
              else {
                var highlightButton = $('<button type="button" id="variables-highlight-button" class="primary ui-button ui-button-text-only ui-state-default"><span class="ui-button-text">Show Nodes</span></button>').appendTo(variableDiv);
                highlightButton.click( function(e) {
                  variable.nodesList.forEach( function(nodeID) {
                    RED.tray.close();
                    RED.view.reveal(nodeID);
                  })
                });
              }
            }
          });
        }
      });
      // $('.variable-row-content').remove();
      // if (RED.variables.variables.length == 0) {
      //     $('<div class="variable-row-content">No Variables Found</div>').appendTo(row);
      // }
      // else {
      //   RED.variables.variables.forEach( function(variable) {
      //     var variableName = variable.uiName;
      //     var variableInUse = variable.inUse;
      //     var variableDiv = $('<div class="variable-row-content"></div>').text(variableName).appendTo(row);
      //     var variableRemoveButton = $('<button type="button" id="variables-remove-button" class="primary ui-button ui-button-text-only ui-state-default"><span class="ui-button-text">Remove Variable</span></button>').appendTo(variableDiv);
      //     variableRemoveButton.click( function(e) {
      //       e.preventDefault();
      //       var variableToBeDeleted = variable.name
      //       console.log(variableToBeDeleted);
      //       RED.variables.variables = RED.variables.variables.filter( function(variable) {
      //         return (variable.name != variableToBeDeleted);
      //       });
      //       console.log(RED.variables.variables);
      //       refreshVariableList();
      //       RED.notify("Variable removed Successfully");
      //     });
      //   });
      // }
    }

    function createAddPane(tabObject) {
      var pane = $('<div id="variables-tab-add" class="node-help"></div>');

      $('<h3></h3>').text("Add New Variable").appendTo(pane);

      var row = $('<div class="variables-form-row"></div>').appendTo(pane);
      $('<label>Variable Name</label>').appendTo(row);
      var variableNameInput = $('<input type="text"></input>').appendTo(row);
      var secondRow = $('<div class="variables-form-row"></div>').appendTo(pane);
      $('<label>Flow Variable?</label>').appendTo(secondRow);
      var variableFlowScopeInput = $('<input type="checkbox" value="flow">').appendTo(secondRow);
      var variableNameButton = $('<button type="button" id="variables-add-button" class="primary ui-button ui-button-text-only ui-state-default"><span class="ui-button-text">Add Variable</span></button>').appendTo(pane);
      variableNameButton.click(function(e) {
          e.preventDefault();
          var isFlowVariable = variableFlowScopeInput.prop('checked');
          var variableNameValue = variableNameInput.val();
          var variableTemplate = variableNameValue;
          var variableExists = RED.variables.variables.some( function(variable) {
            return (variable.name == variableTemplate);
           });
           if (variableExists) {
             variableNameInput.addClass('input-error');
           }
           else {
             variableNameInput.removeClass('input-error');
             if (isFlowVariable) {
               RED.variables.variables.push({
                 name: variableNameValue,
                 uiName: variableNameValue,
                 exists: false,
                 flowID: window.location.hash.substring(6),
                 nodesList: []
               });
             }
             else {
               RED.variables.variables.push({
                 name: variableNameValue,
                 uiName: variableNameValue,
                 exists: false,
                 flowID: null,
                 nodesList: []
               });
             }
             updateVariableFile(RED.variables.variables).done(function (){
               refreshVariableList();
               variableFlowScopeInput.prop('checked', false);
               variableNameInput.val("");
               RED.notify("Variable added Successfully");
             }).fail(function(err) {
               RED.notify("Updating variable file failed!");
             })

           }
      });


      return pane;
    }

    function updateVariableFile(variables) {
      var options = {};
      var body = {
        variables: variables
      };
      options.url = "projects/variables";
      options.type = "POST";
      options.data = JSON.stringify(body);
      options.contentType = "application/json; charset=utf-8";
      return $.ajax(options);
    }


    function pruneVariableInUse(node) {
        RED.variables.variables = RED.variables.variables.map( function(variable) {
          if (variable.nodesList.includes(node.id)) {
            variable.nodesList = variable.nodesList.filter( function(val) { return val != node.id });
            if (variable.nodesList.length == 0) {
              variable.exists = false;
            }
          }
          return variable;
        });
      updateVariableFile(RED.variables.variables).done(function (){
        refreshVariableList();
      }).fail(function(err) {
        RED.notify("Updating variable file failed!");
      });
    }

    function updateVariableInUse(node) {
      // Check for new usages of variables
      if (node.payloadType == 'variable') {
        RED.variables.variables = RED.variables.variables.map( function(variable) {
          if (node.payload == variable.name) {
            if (!variable.nodesList.includes(node.id)) {
              variable.nodesList.push( node.id );
              variable.exists = true;
            }
          }
          return variable;
        });
        updateVariableFile(RED.variables.variables).done(function (){
          refreshVariableList();
        }).fail(function(err) {
          RED.notify("Updating variable file failed!");
        });
      }
      // check for removal of variables
      else {
        pruneVariableInUse(node);
      }
    }

    function init() {
        RED.actions.add("core:show-variables",show);

        RED.events.on("editor:save", updateVariableInUse);
        RED.events.on("nodes:remove", pruneVariableInUse);

        addPane({
            id:'view',
            title: "View Variables",
            get: createViewPane,
            close: function() {
            }
        });

        addPane({
          id:'add',
          title: "Add Variables",
          get: createAddPane,
          close: function() {
          }
        })

    }
    return {
        init: init,
        show: show,
        add: addPane,
        variables: []
    };
})();
