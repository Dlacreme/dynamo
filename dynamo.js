var Dynamo = {
    Init: {
        All: function() {
            Dynamo.Init.Tooltip(); //
            Dynamo.Init.Select(); //
            Dynamo.Lazy.Preload(); //           
        }
        ,
        Tooltip: function() {
            $("[data-toggle='tooltip']").bootstrapToggle('destroy')            
            $('[data-toggle="tooltip"]').tooltip();            
        }
        ,
        Select: function(cont) {
            if (cont === undefined) {
                cont = $('body')
            }
            cont.find('.selecttwo:not([class^="select2"])').each(function (i, obj) {
                selectElem = $(obj);

                url = selectElem.data('url');
                defaultValues = selectElem.data('value');
                isMultiple = selectElem('multiple');

                params = {
                    width: 'resolve'
                };

                // Is Ajax?
                // Url should fetch array with text: 'text to display', id: 12 #object id
                if (url !== undefined) {
                    params.ajax = {
                        url: url,
                        dataType: 'json'
                    };
                }

                // Is Multiple?
                // Then id should be splitted using coma
                if (isMultiple != undefined) {
                    params.multiple = true;
                    params.separator = ',';
                }

                // Init object
                $(selectElem).select2(params);
                
                // Do we have default value?
                if (defaultValues !== undefined) {
                    tmp_values = defaultValues.split("|");
                    $(selectElem).select2("trigger", "select", {
                        data: {id: tmp_values[0], text: tmp_values[1]}
                    });
                }
            });
        }
    }
    ,
    Lazy: {
        /*
        **  Lazy will preload your html templates
        **  Usage: <div id="stocknew" class="preload" data-url="/stock/new"></div>
        **  The data-url function will be store and the id will be used as a key
        **  So after you can simply use the template using: Dynamy.Lazy.Templates["stocknew"]
        */
        Templates: {} // Cache
        ,
        Preload: function() {
            $('.preload')
                .each(function(i, obj) {
                    url = $(obj).data('url');
                    id = $(obj).attr('id');
                    $.ajax({
                        url: url,
                        success: function(html) {
                            templates[id] = html
                        }, error: function(html) {
                            console.error("[Dynamo]: Cannot preload template: ", id);
                        }
                    });
                });
        }
    }
    ,
    Forward: {
        /*
        **  Forward allow to quickly switch UIs:
        **  - switch full url
        **  - dynamically inject data within tag or input // Useful for modal
        **  - modal interaction
        */
        Html: function(url) {
            window.location.replace(url);
        }
    }
}
