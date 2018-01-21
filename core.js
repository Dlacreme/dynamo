function initAll() {

    templates = {};


    Dynamo.Validator.ModalValidation($('[data-validation]'))
    initSelect2($('#layout'));
    $('.preload').each(function(i, obj) {
        url = $(obj).data('url');
        id = $(obj).attr('id');
        $.ajax({
            url: url,
            success: function(html) {
                templates[id] = html
            }, error: function(html) {
                console.error("Cannot preload template");
            }
        });
    });
}

function reloadToggle() {
    $("[data-toggle='toggle']").bootstrapToggle('destroy')
    $("[data-toggle='toggle']").bootstrapToggle();
}

function initSelect2(cont) {
    // $(cont).find('.selecttwo:[class^="select2"]').select2("destroy");
    window.setTimeout(function() {
    cont.find('.selecttwo:not([class^="select2"])').each(function (i, obj) {
        e = $(obj);
        u = e.data('url');
        dev = e.data('value');
        multi = e.data('multiple');
        params = {
            width: 'resolve'
        };
        if (u !== undefined) {
            params.ajax = {
                url: u,
                dataType: 'json'
            }
        }
        if (multi !== undefined) {
            params.multiple = true;
            params.separator = ',';
        }
        $(e).select2(params);
        if (dev !== undefined) {
            tmp_dev = dev.split("|");
            $(e).select2("trigger", "select", {
                data: { id: tmp_dev[0], text: tmp_dev[1] }
            });
        }
    });
});
}

var Dynamo = {
    Html: {
        Clone: function(item, container) {
            data = $(item).clone().removeAttr("id").removeClass("hidden")
            data.appendTo(container);
            window.setTimeout(function() {
                $(container).find('.selecttwo').select2("destroy");
                initSelect2($(container));
            });
        }, RemoveSelf: function(e, classTarget) {
            var p = e.target.parentNode;
            while (!$(p).hasClass(classTarget)) {
                p = p.parentNode;
            }
            p.remove();
        }, RemoveElem: function(elem, classTarget) {
            $(elem).remove();
        }
    }
    ,
    Forward:
    {
        Set: function (mappingTag, mappingInput) {
            for (id in mappingTag) { $('#' + id).text(mappingTag[id]); }
            for (id in mappingInput) {
                elem = $('#' + id);
                if (elem.hasClass('selecttwo')) {
                    elem.attr('data-value', mappingInput[id]);
                } else {
                    elem.val(mappingInput[id]);                    
                }
            }
        },
        Template: function(templateId, container) {
            var closeHtml = '<span class="close" onclick="Dynamo.Forward.Close('+container+')"><i class="fa fa-times"></i></span>';            
            var cont = container == null ? $('#forward-container') : $(container);
            if (templates[templateId] === undefined) {
                console.error("Error template not found");
            }
            cont.html(templates[templateId]).append(closeHtml).removeClass('hidden');
            window.setTimeout(function() {
                initSelect2(cont);
            });
        }
        ,
        Ajax: function(url, container) {
            var closeHtml = '<span class="close" onclick="Dynamo.Forward.Close('+container+')"><i class="fa fa-times"></i></span>';            
            var cont = container == null ? $('#forward-container') : $(container);
            $.ajax({
                url: url,
                success: function(html) {
                    cont.html(html).append(closeHtml).removeClass('hidden');
                    window.setTimeout(function() {
                        initSelect2(cont);
                    });
                }, error: function() {
                    console.error("Fail to load : ", url);
                }
            });
        }
        ,
        Html: function(url) {
            window.location.replace(url);
        }
        ,
        Display: function(contentSelector, container) {
            var closeHtml = '<span class="close" onclick="Dynamo.Forward.Close('+container+')"><i class="fa fa-times"></i></span>';
            var html = $(contentSelector).clone();
            html.removeAttr('id');
            var cont = container == null ? $('#forward-container') : $(container);
            Dynamo.Forward.Close(container == null ? '#forward-container' : container);
            //return;
            cont.removeClass('hidden').html(html).append(closeHtml);
            window.setTimeout(function() {
                initSelect2(cont);
            });
        },
        Close: function(container) {
            $(container).find('.selecttwo').select2("destroy");
            var cont = container == null ? $('#forward-container') : $(container)
            cont.addClass('hidden').html('');            
        },
        SetAndDisplay: function(mappingTag, mappingInput, contentSelector) {
            Dynamo.Forward.Set(mappingTag, mappingInput);
            window.setTimeout(Dynamo.Forward.Display(contentSelector), 0);
        }
    }
    ,
    Ajax: {
        Submit: function (formId, containerId, insertMode = 1, formatFunc = -1 , resultContainer = '#ajax-result') {
            var form = $(formId);

            // Test
            var controls = form.find("[data-control]");
            for (var i = 0 ; i < controls.length ; i++) {
                if (Dynamo.Validator.test(controls[i]) === false) { return; }
            }

            var method = form.attr('method');
            $.ajax({
                url: form.attr('action'),
                method: method === undefined ? 'GET' : method,
                data: formatFunc === -1 ? form.serialize() : formatFunc(),
                success: function (data) {
                    Dynamo.Ajax.Private.Success(data, containerId, insertMode, resultContainer);
                    $('.modal').modal('hide');
                },
                error: function (error) {
                    Dynamo.Ajax.Private.Error(error, resultContainer);
                }
            });
        }
        ,
        BuildId: function(prefix, idInputContainer)
        {
            var val = $(idInputContainer).val();
            return prefix + val;
        }
        ,
        InsertMode: {
            Replace: 1,
            InsertTop: 2,
            InsertBottom: 3,
            Delete: 4,
            ReplaceElem: 5
        }
        ,
        Private: {
            Success: function (data, containerId, insertMode, resultContainer) {
                Dynamo.Message.Success("Success");
                if (insertMode == Dynamo.Ajax.InsertMode.Replace)
                    $(containerId).html(data);
                else if (insertMode == Dynamo.Ajax.InsertMode.InsertTop)
                    $(containerId).prepend(data);
                else if (insertMode == Dynamo.Ajax.InsertMode.InsertBottom)
                    $(containerId).append(data);
                else if (insertMode == Dynamo.Ajax.InsertMode.Delete)
                    $(containerId).remove();
                if (insertMode == Dynamo.Ajax.InsertMode.ReplaceElem)
                    $(containerId).replaceWith(data);
                window.setTimeout(function () {
                    initAll();
                    reloadToggle();
                }, 0);
            },
            Error: function (error, resultContainer) {
                Dynamo.Message.Error("Failed");
            }
    
        }
    }
    ,
    Validator:
    {
        ModalValidation: function(elems) {
            $(elems).on('click', function() {
                func = $(this).data('validation');
                
                $('#modal-validator-button').unbind('click');
                $('#modal-validator-button').on('click', function() {
                    $('#validation-modal').modal('hide');                    
                    eval(func);
                });

                $('#validation-modal').modal();
            });
        },
        // Apply validation of all input and call submit if successful. Else, display warnings.
        submit: function(form)
        {
            elemForm = $(form);
            controls = elemForm.find("[data-control]");
            for (var i = 0 ; i < controls.length ; i++) {
                if (Dynamo.Validator.test(controls[i]) === false) { return; }
            }
            elemForm.submit();
        }
        ,
        // Test Input and display warnings if fail
        test: function(control)
        {
            elem = $(control);
            input = $(elem.data('control'));
            regex = elem.data('format');
            classToAdd = input.data('errorclass');            
            if (regex === "select2") {
                if ($(elem.data('control') + ' :selected').text().length > 0) {
                    elem.hide();
                    input.removeClass(classToAdd);
                    return true;
                }
                input.addClass(classToAdd);
                elem.show();
                return false;
            }
            if (new RegExp(regex, "g").test(input.val())) {
                elem.hide();
                input.removeClass(classToAdd);
                return true;
            }
            input.addClass(classToAdd);
            elem.show();
            return false;
        }
    }
    ,
    Message:
    {
        Info: function (content, container = '#ajax-result') {
            Dynamo.Message.Private.HideTimeout(container);
            return Dynamo.Message.Private.InsertInto(container, Dynamo.Message.Private.Build('info', '<i class="fa fa-information"></i>', content));
        },
        Success: function (content, container = '#ajax-result') {
            Dynamo.Message.Private.HideTimeout(container);
            return Dynamo.Message.Private.InsertInto(container, Dynamo.Message.Private.Build('success', '<i class="fa fa-check"></i>', content));
        },
        Error: function (content, container = '#ajax-result') {
            Dynamo.Message.Private.HideTimeout(container);
            return Dynamo.Message.Private.InsertInto(container, Dynamo.Message.Private.Build('danger', '<i class="fa fa-exclamation-triangle"></i>', content));
        },
        Warning: function (content, container = '#ajax-result') {
            Dynamo.Message.Private.HideTimeout(container);
            return Dynamo.Message.Private.InsertInto(container, Dynamo.Message.Private.Build('warning', '<i class="fa fa-exclamation"></i>', content));
        }
        ,
        Private: {
            HideTimeout: function (container) {
                window.setTimeout(function () {
                    $('#ajax-result').html('');
                }, 3000);
            },
            InsertInto: function (container, content) {
                return $(container).html(content);
            },
            Build: function (cls, strong, message) {
                return '<div class="alert alert-' + cls + '"><a href="#" class="fa fa-close close" data-dismiss="alert" aria-label="close" title="close" style="margin-top:4px;"></a><strong>' + strong + '&nbsp;&nbsp;</strong>' + message + '</div>';
            }
        }
    }
}