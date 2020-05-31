
    /****************** Export configuration ******************/
    function export_conf() {
        jsonData = localStorage.getItem('device_conf');
        content = jsonData;
        fileName = 'device_conf.txt';
        contentType = 'text/plain';
        var a = document.createElement("a");
        var file = new Blob([content], {type: contentType});
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
    }
    /****************** Import configuration ******************/
    document.querySelector("#file-input").addEventListener('change', function() {
        // files that user has chosen
        var all_files = this.files;
        if(all_files.length == 0) {
            alert('Error : No file selected');
            return;
        }

        // first file selected by user
        var file = all_files[0];

        // files types allowed
        var allowed_types = [ 'text/plain' ];
        if(allowed_types.indexOf(file.type) == -1) {
            alert('Error : Incorrect file type');
            return;
        }

        // Max 2 MB allowed
        var max_size_allowed = 2*1024*1024
        if(file.size > max_size_allowed) {
            alert('Error : Exceeded size 2MB');
            return;
        }

        // file validation is successfull
        // we will now read the file

        var reader = new FileReader();

        // file reading finished successfully
        reader.addEventListener('load', function(e) {
            var device_conf = e.target.result;

            // contents of the file
            localStorage.setItem('configured',true);
            localStorage.setItem("device_conf", device_conf);
            location.reload();
        });

        // file reading failed
        reader.addEventListener('error', function() {
            alert('Error : Failed to read file');
        });

        // read as text file
        reader.readAsText(file);
    });

    function delete_graph(id){
        $('#graph_'+id).remove();
        device_conf = localStorage.getItem("device_conf");
        device_conf = JSON.parse(device_conf);
        for( var i = 0; i < device_conf.length; i++){ 
           if ( device_conf[i].graphID === id) {
             device_conf.splice(i, 1); 
           }
        }
        if(device_conf.length==0){
            localStorage.removeItem("device_conf");
            localStorage.removeItem("configured");
        }
        else{
            device_conf = JSON.stringify(device_conf);
            localStorage.setItem("device_conf", device_conf);
        }
        location.reload();
    }

    function edit_graph(id){
        device_conf = localStorage.getItem("device_conf");
        device_conf = JSON.parse(device_conf);
        for( var i = 0; i < device_conf.length; i++){ 
           if ( device_conf[i].graphID === id) {

                $('#topicID_1').val(device_conf[i].topicID[0]);
                $('#keyToPlot_1').val(device_conf[i].keyToPlot[0]);
                $('#multiplier_1').val(device_conf[i].multiplier[0]);

                total_keys = device_conf[i].topicID.length;
                if(total_keys>1){
                    for (j = 1 ;j<total_keys; j++) {
                        add_layer();
                        index = j+1;
                        $('#topicID_'+index).val(device_conf[i].topicID[j]);
                        $('#keyToPlot_'+index).val(device_conf[i].keyToPlot[j]);
                        $('#multiplier_'+index).val(device_conf[i].multiplier[j]);
                    }
                }
                
                $('#graphTitle').val(device_conf[i].graphTitle);
                $('#graphType').val(device_conf[i].graphType);
                //$('#graphSize').val(device_conf[i].graphSize);
                $('#no_of_points').val(device_conf[i].no_of_points);

                $('#configured_data_form').attr('onsubmit','update_graph_conf('+id+')');
                if(device_conf[i].graphType=='column'||device_conf[i].graphType=='line'||device_conf[i].graphType=='gauge-activity-default'){
                    $("#add_source_btn").attr('disabled',false);
                }
                else{
                    $("#add_source_btn").attr('disabled',true);
                }

                if(device_conf[i].graphType=='column'||device_conf[i].graphType=='line'||device_conf[i].graphType=='line-time-series-default'){
                    $("#no_of_points").attr('disabled',false);
                }
                else{
                    $("#no_of_points").attr('disabled',true);
                }
           }
        }
        $('#configure_data_source').modal('show');
    }

    function toJSONString_graph( form ) {
        var obj = {
            'x':0,
            'y':0,
            'width':6,
            'height':4,
            'type':'graph',
            'graphType':'',
            'graphTitle':'',
            // 'graphSize': '',
            'no_of_points': 20,
            'topicID':[],
            'keyToPlot':[],
            'multiplier':[],
        };
        var elements = form.querySelectorAll( "input, select, textarea" );
        for( var i = 0; i < elements.length; ++i ) {
            var element = elements[i];
            var name = element.name;
            var value = element.value;
            if( name == 'graphType'|| name == 'graphTitle' || name == 'no_of_points') {
                obj[ name ] = value;
            }
            else{
                name = name.substring(0, name.length - 2);
                if(name){
                   obj[name].push(value);
                }
            }
        }
        return obj;
    }


    function save_graph_conf() {
        var form = document.getElementById( "configured_data_form" );
        var conf = toJSONString_graph( form );
        graph_id = Math.random();
        if(!localStorage.getItem("device_conf")){
            localStorage.setItem('configured',true);
            device_conf = [];
            conf.graphID = graph_id;
            device_conf.push(conf);
            device_conf = JSON.stringify(device_conf);
            localStorage.setItem("device_conf", device_conf);
            $('#configure_data_source').modal('hide');
            
            all_devices = JSON.parse(localStorage.getItem('devices'));
            add_graph(conf,all_devices[0].device_id,'configuration');
            location.reload();
        }
        else{
            device_conf = localStorage.getItem("device_conf");
            device_conf = JSON.parse(device_conf);
            conf.graphID = graph_id;

            // y_temp = device_conf[device_conf.length-1].y;
            // height_temp = device_conf[device_conf.length-1].height;

            last_yh = 0;
            device_conf.forEach((item,i)=>{
                device_conf[i].y = device_conf[i].y+conf.height;
                // if((item.y+item.height)>last_yh){
                //     last_yh = item.y+item.height;
                //     conf.y = last_yh;
                // }
            });

            device_conf.push(conf);
            device_conf = JSON.stringify(device_conf);
            localStorage.setItem("device_conf", device_conf);
            $('#configure_data_source').modal('hide');

            all_devices = JSON.parse(localStorage.getItem('devices'));
            //add_graph(conf,all_devices[0].device_id,'configuration');
            location.reload();
        }
    }

    function update_graph_conf(id) {
        var form = document.getElementById( "configured_data_form" );
        var conf = toJSONString_graph( form );
        conf.graphID = id;
        device_conf = localStorage.getItem("device_conf");
        device_conf = JSON.parse(device_conf);
        for( var i = 0; i < device_conf.length; i++){ 
           if ( device_conf[i].graphID === id) {
                conf.x = device_conf[i].x;
                conf.y = device_conf[i].y;
                conf.width = device_conf[i].width;
                conf.height = device_conf[i].height;
                device_conf[i] = conf;
           }
        }
        device_conf = JSON.stringify(device_conf);
        localStorage.setItem("device_conf", device_conf);

        location.reload();
    }

    
    function toJSONString_device( form ) {
        var obj = {
            'x':0,
            'y':0,
            'width':4,
            'height':2,
        };
        var elements = form.querySelectorAll( "input, select, textarea" );
        for( var i = 0; i < elements.length; ++i ) {
            var element = elements[i];
            var name = element.name;
            var value = element.value;
            obj[ name ] = value;
            if(name == 'device_control_min_val'){
                obj['value'] = value;
            }
        }
        return obj;
    }

    function edit_device_control(id){
        device_conf = localStorage.getItem("device_conf");
        device_conf = JSON.parse(device_conf);
        for( var i = 0; i < device_conf.length; i++){ 
           if ( device_conf[i].divID === id) {
            $('#type').val(device_conf[i].type);
             $('#device_control_topic_id').val(device_conf[i].device_control_topic_id);
             $('#device_control_key').val(device_conf[i].device_control_key);
             $('#device_control_min_val').val(device_conf[i].device_control_min_val);
             $('#device_control_max_val').val(device_conf[i].device_control_max_val);
             $('#device_control_multiplier').val(device_conf[i].device_control_multiplier);
             $('#device_control_title').val(device_conf[i].device_control_title);

             if(device_conf[i].type=="toogle-switch"){
                $('#device_control_min_val').attr('disabled',true);
                $('#device_control_max_val').attr('disabled',true);
                $('#device_control_multiplier').attr('disabled',true);
             }
             else{
                $('#device_control_min_val').attr('disabled',false);
                $('#device_control_max_val').attr('disabled',false);
                $('#device_control_multiplier').attr('disabled',false);
             }
             $('#device_control_size').val(device_conf[i].device_control_size);
             $('#configure_device_form').attr('onsubmit','update_device_conf('+id+')');
           }
        }
        $('#configure_device_control').modal('show');
    }


    function delete_device_control(id){
        
        device_conf = localStorage.getItem("device_conf");
        device_conf = JSON.parse(device_conf);
        for( var i = 0; i < device_conf.length; i++){ 
           if ( device_conf[i].divID === id) {
             device_conf.splice(i, 1); 
           }
        }
        if(device_conf.length==0){
            localStorage.removeItem("device_conf");
            localStorage.removeItem("configured");
        }
        else{
            device_conf = JSON.stringify(device_conf);
            localStorage.setItem("device_conf", device_conf);
        }
        location.reload();
    }

    function save_device_conf(){
        let form = document.getElementById( "configure_device_form" );
        let conf = toJSONString_device( form );
        div_id = Math.random();

        $('#configure_device_control').modal('hide');
        if(!localStorage.getItem("device_conf")){
            localStorage.setItem('configured',true);
            device_conf = [];
            conf.divID = div_id;
            device_conf.push(conf);
            device_conf = JSON.stringify(device_conf);
            localStorage.setItem("device_conf", device_conf);
            $('#configure_data_source').modal('hide');
            
            all_devices = JSON.parse(localStorage.getItem('devices'));
            add_graph(conf,all_devices[0].device_id,'configuration');
            location.reload();
        }
        else{
            device_conf = localStorage.getItem("device_conf");
            device_conf = JSON.parse(device_conf);
            conf.divID = div_id;

            //x_temp = device_conf[device_conf.length-1].x;
            //width_temp = device_conf[device_conf.length-1].width;
            // y_temp = device_conf[device_conf.length-1].y;
            // height_temp = device_conf[device_conf.length-1].height;

            //conf.y = y_temp+height_temp;

            // last_yh = 0;
            // device_conf.forEach(item=>{
            //     if((item.y+item.height)>last_yh){
            //         last_yh = item.y+item.height;
            //         conf.y = last_yh;
            //     }
            // });
            already_exist = false;
            last_yh = 0;
            device_conf.forEach((item,i)=>{
                if(item.type!='graph'){
                    if(conf.device_control_key==item.device_control_key||conf.device_control_topic_id==item.device_control_topic_id){
                        
                        already_exist = true;
                    }
                }
                device_conf[i].y = device_conf[i].y+conf.height;
            });
            if(!already_exist){
                device_conf.push(conf);
                device_conf = JSON.stringify(device_conf);
                localStorage.setItem("device_conf", device_conf);
                $('#configure_data_source').modal('hide');

                location.reload();
            }
            else{
                alert('key name or topic id already exist');
            }
            
            //all_devices = JSON.parse(localStorage.getItem('devices'));
            //add_graph(conf,all_devices[0].device_id,'configuration');
        }
    }

    function update_device_conf(id){
        let form = document.getElementById( "configure_device_form" );
        let conf = toJSONString_device( form );
        conf.divID = id;
        device_conf = localStorage.getItem("device_conf");
        device_conf = JSON.parse(device_conf);

        $('#configure_device_control').modal('hide');

        for( var i = 0; i < device_conf.length; i++){ 
            if ( device_conf[i].divID === id) {
                conf.x = device_conf[i].x;
                conf.y = device_conf[i].y;
                conf.width = device_conf[i].width;
                conf.heigth = device_conf[i].heigth;
                device_conf[i] = conf;
            }
        }
        device_conf = JSON.stringify(device_conf);
        localStorage.setItem("device_conf", device_conf);

        location.reload();
    }

    function select_graph(type) {
         $('#configured_data_form').trigger("reset");
         $('#configured_data_form').attr('onsubmit','save_graph_conf()');
        if(type=='column'||type=='line'||type=='gauge-activity-default'){
            $("#add_source_btn").attr('disabled',false);
        }
        else{
            $("#add_source_btn").attr('disabled',true);
        }
        if(type=='column'||type=='line'||type=='line-time-series-default'){
            $("#no_of_points").attr('disabled',false);
        }
        else{
            $("#no_of_points").attr('disabled',true);
        }
        $('#graphType').val(type);
        $('#add_element').modal('hide');
    }
    function configure_device_control(type) {
        $('#configure_device_form').trigger("reset");
        $('#type').val(type);
        $('#device_control_topic_id').val('');
        $('#device_control_key').val('');
        $('#device_control_title').val('');
        $('#configure_device_form').attr('onsubmit','save_device_conf()');

        if(type=="toogle-switch"){
            $('#device_control_min_val').val(0);
            $('#device_control_min_val').attr("disabled", true);
            $('#device_control_max_val').val(1);
            $('#device_control_max_val').attr("disabled", true);
            $('#device_control_multiplier').val(1);
            $('#device_control_multiplier').attr("disabled", true);
        }
        else{
            $('#device_control_min_val').val(1);
            $('#device_control_min_val').attr("disabled", false);
            $('#device_control_max_val').val(10);
            $('#device_control_max_val').attr("disabled", false);
            $('#device_control_multiplier').val(1);
            $('#device_control_multiplier').attr("disabled", false);
        }
        $('#add_element').modal('hide');
    }
    layer_counter = 1;
    function add_layer(){
        layer_counter++;
        layer_id = "layer_"+layer_counter;
        $('#source_layers').append(`<div class="col-md-11" id="`+layer_id+`">
            <div class="row">
                <div class="col-md-4">
                    <label for="topicID">Topic ID:</label>
                    <input type="number" class="form-control" id="topicID_`+layer_counter+`" name="topicID_`+layer_counter+`" required>
                </div>
                <div class="col-md-4">
                    <label for="keyToPlot">Key:</label>
                    <input type="text" class="form-control" id="keyToPlot_`+layer_counter+`" name="keyToPlot_`+layer_counter+`" required>
                </div>
                <div class="col-md-4">
                    <label for="multiplier">Multiplier:</label>
                    <input type="number" class="form-control" id="multiplier_`+layer_counter+`" name="multiplier_`+layer_counter+`" required>
                </div>
            </div>
        </div>
        <div class="col-md-1" id="`+layer_id+`_btn">
            <button type="button" class="close mt-4_5" onclick="remove_layer(`+layer_id+`)" style="float: left">&times;</button>
        </div>`);
    }

    function remove_layer(e){
        $('#'+e.id).remove();
        $('#'+e.id+'_btn').remove();
    }

    function populate_auth(){
        if(localStorage.getItem('token')){
            $("#projectId").val(localStorage.getItem('projectId'));
            $("#token").val(localStorage.getItem('token'));
            $("#projectID_error").html('');
            $("#token_error").html('');
        }
    }