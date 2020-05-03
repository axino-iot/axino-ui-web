
all_chart = [];

setInterval(function(){
    if (localStorage.getItem('token')&&localStorage.getItem('configured')) {
        get_all_devices_data();
    }
} , 60000);

function getDeviceData(id) {
    if(localStorage.getItem('configured')){
        device_conf = JSON.parse(localStorage.getItem('device_conf'));
        $('#graphs_div_conf').html('');
        device_conf.forEach(conf=>{
            add_graph(conf,id,'view');
        });
    }
    get_latest_data(id);
    get_latest_downlinks(id);
}

function get_latest_data(id){
    if(!localStorage.getItem('data_'+id)||JSON.parse(localStorage.getItem('data_'+id)).length == 0){
        $.ajax({
            url: "https://console.axino.co/api/v2/uplinks?access_token="+localStorage.getItem('token')+"&device_id="+id+"&limit=100",
            type: 'GET',
            success: function (data) {
                if(data.length>0){
                    data.forEach((entry,i)=>{
                        data[i].payload = Base64.decode(entry.payload);
                    });
                }
                localStorage.setItem('data_'+id,JSON.stringify(data));
                
            },
            error: function (err) {
                console.log(err);
                alert_message('Connection Failed','warning',3000);
            }
        });
    }
    else{
        let local_data = JSON.parse(localStorage.getItem('data_'+id));
        last_message_id = local_data[local_data.length-1].id;
        $.ajax({
            url: "https://console.axino.co/api/v2/uplinks?access_token="+localStorage.getItem('token')+"&device_id="+id+"&id=~gt~"+last_message_id+"&limit=1000",
            type: 'GET',
            success: function (data) {
                data.forEach(data_obj=>{
                    data_obj.payload = Base64.decode(data_obj.payload);
                    local_data.push(data_obj);
                })

                localStorage.setItem('data_'+id,JSON.stringify(local_data));
                if(data.length>=1000){
                    setTimeout(function(){ get_latest_data(id); }, 3000);
                }
                else if(localStorage.getItem('configured')&&data.length>0){
                    if(localStorage.getItem("selected_device")==id){
                        device_conf = JSON.parse(localStorage.getItem("device_conf"));
                        device_conf.forEach(conf=>{
                            if(conf.type=='graph'){
                                update_graph(conf,id);
                            }
                        });
                    }
                }
                else{
                }
            },
            error: function (err) {
                console.log(err);
                alert_message('Connection Failed','warning',3000);
            }
        });
    }
}

function get_latest_downlinks(id){
    if(!localStorage.getItem('downlinks_'+id)||JSON.parse(localStorage.getItem('downlinks_'+id)).length == 0){
        $.ajax({
            url: "https://console.axino.co/api/v2/downlinks?access_token="+localStorage.getItem('token')+"&device_id="+id,
            type: 'GET',
            success: function (data) {
                if(data.length>0){
                    data.forEach((entry,i)=>{
                        data[i].payload = Base64.decode(entry.payload);
                    });
                }
                localStorage.setItem('downlinks_'+id,JSON.stringify(data));
                
            },
            error: function (err) {
                console.log(err);
                alert_message('Connection Failed','warning',3000);
            }
        });
    }
    else{
        $.ajax({
            url: "https://console.axino.co/api/v2/downlinks?access_token="+localStorage.getItem('token')+"&device_id="+id+"&limit=1000",
            type: 'GET',
            success: function (data) {
                let local_data = [];
                data.forEach(data_obj=>{
                    data_obj.payload = Base64.decode(data_obj.payload);
                    local_data.push(data_obj);
                })

                localStorage.setItem('downlinks_'+id,JSON.stringify(local_data));
                if(data.length>=1000){
                    setTimeout(function(){ get_latest_data(id); }, 3000);
                }
                if(localStorage.getItem('configured')&&data.length>0){
                    if(localStorage.getItem("selected_device")==id){
                        device_conf = JSON.parse(localStorage.getItem("device_conf"));
                        device_conf.forEach(conf=>{
                            if(conf.type!='graph'){
                                update_graph(conf,id);
                            }
                        });
                    }
                }
            },
            error: function (err) {
                console.log(err);
                alert_message('Connection Failed','warning',3000);
                devices = JSON.parse(localStorage.getItem('devices'));
                devices.forEach((device,i)=>{
                    devices[i].is_online = 0;
                });
                localStorage.setItem('devices',JSON.stringify(devices));
            }
        });
    }
}

custom_date_formats = {
  past: [
      { ceiling: 60, text: "less than a minute ago" },
      { ceiling: 3600, text: "$minutes minutes ago" },
      { ceiling: 86400, text: "$hours hours ago" },
      { ceiling: 2629744, text: "$days days ago" },
      { ceiling: 31556926, text: "$months months ago" },
      { ceiling: null, text: "$years years ago" }  
  ]
}    

function getDevices(projectID, token) {
    $.ajax({
        url: "https://console.axino.co/api/v2/devices?access_token=" + localStorage.getItem('token'),
        type: 'GET',
        success: function (devices) {
            localStorage.setItem('devices',JSON.stringify(devices));
        },
        error: function (err) {
            console.log(err);
            alert_message('Unable to find new data','warning',3000);
        }
    });
    devices = localStorage.getItem('devices');
    devices = JSON.parse(devices);
    devices.forEach(device => {
    last_seen =  humanized_time_span(device.last_seen, new Date(), custom_date_formats);
        if(device.device_id==localStorage.getItem('selected_device')){
            getDeviceData(device.device_id);
            $('#sidebar').append($('<a>', {class:'active',text:device.name,id:device.device_id,onclick:'select_device('+device.device_id+')',style:'border-bottom:1px solid rgba(0,0,0,.125)'}));
            $('#'+device.device_id).append($('<br>',{}));
            if(device.is_online==1){
                //$('#'+device.device_id).append($('<i>', {class:'fa fa-circle',style:'color:#0d0;font-size:0.75rem;',text:' Online'}));
                $('#'+device.device_id).append('<span><i class="fa fa-circle" style="color:#0d0"></i>&nbsp;&nbsp; Online</span>');
            }
            else{
                //$('#'+device.device_id).append($('<i>', {class:'fa fa-circle',style:'color:#aaa;font-size:0.75rem;',text:' '+last_seen}));
                $('#'+device.device_id).append('<span><i class="fa fa-circle" style="color:#ccc"></i>&nbsp;&nbsp; ' + last_seen +'</span>');                
            }

        }
        else{
            $('#sidebar').append($('<a>', {text:device.name,id:device.device_id,onclick:'select_device('+device.device_id+')',style:'border-bottom:1px solid rgba(0,0,0,.125)'}));
            $('#'+device.device_id).append($('<br>',{}));
            if(device.is_online==1){
                $('#'+device.device_id).append('<span><i class="fa fa-circle" style="color:#0d0"></i>&nbsp;&nbsp; Online</span>');
                //$('#'+device.device_id).append($('<i>', {class:'fa fa-circle',style:'color:#0d0;font-size:0.75rem;',text:' Online'}));
            }
            else{
                //$('#'+device.device_id).append($('<i>', {class:'fa fa-circle',style:'color:#aaa;font-size:0.75rem;',text:' '+last_seen}));
                $('#'+device.device_id).append('<span><i class="fa fa-circle" style="color:#ccc"></i>&nbsp;&nbsp; ' + last_seen +'</span>');

            }
        }
    });
}

function select_device(id){
    $(".sidebar a").removeClass("active");
    $('#'+id).addClass('active');
    localStorage.setItem('selected_device',id);
    getDeviceData(id);
}


function configure(){
    window.location.href = 'config_page.html';
}

function show_dashboard(){
    window.location.href = 'index.html';
}

//********************* For Authorization **********************//
function connect() {
    localStorage.clear();
    $.ajax({
        url: "https://console.axino.co/api/v2/devices?access_token=" + $("#token").val(),
        type: 'GET',
        success: function (devices) {
            localStorage.setItem("token", $("#token").val());
            localStorage.setItem("projectId", $("#projectId").val());
            localStorage.setItem('devices',JSON.stringify(devices));
            localStorage.setItem('selected_device',devices[0].device_id);
            $("#add_element_btn").removeAttr("disabled");
            get_all_devices_data();
            $('#auth_indicator').attr('style','color:green');
            alert_message('Successfully Connected','success',3000);
        },
        error: function (err) {
            console.log(err);
            alert_message('Unable to connect please verify your Access Token','danger',3000);
        }
    });
}

function get_all_devices_data(){

    alert_message('Looking for new data . . .','info',2000);
    all_devices = localStorage.getItem('devices');
    all_devices = JSON.parse(all_devices);
    all_devices.forEach(device_item=>{
        get_latest_data(device_item.device_id);
        get_latest_downlinks(device_item.device_id);
    });
}

function add_graph(conf,device_id,page){
    if(conf.type=='graph'){
        if(page=="configuration"){
            $('#div_main').append(`
            <div class="grid-stack-item" id="`+conf.graphID+`" data-gs-x="`+conf.x+`" data-gs-y="`+conf.y+`" data-gs-width="`+conf.width+`" data-gs-height="`+conf.height+`">
              <div class="row" >
                    <div style="z-index:1000"><h3  onclick="delete_graph(`+conf.graphID+`)" style='cursor:pointer;margin-left:18px;'>&times</h3></div>
                    <div style="z-index:1000" ><span onclick="edit_graph(`+conf.graphID+`)" style='cursor:pointer;margin-left:18px;'><i style='padding-top:8px;' class="fa fa-edit"></i></span></div>
                </div>
              <div class="grid-stack-item-content" id="graph_`+conf.graphID+`"></div>
            </div>`);
        }
        else{
            $('#div_main').append(`
            <div class="grid-stack-item" data-gs-no-resize="true" data-gs-no-move="true" id="`+conf.graphID+`" data-gs-x="`+conf.x+`" data-gs-y="`+conf.y+`" data-gs-width="`+conf.width+`" data-gs-height="`+conf.height+`">
              <div class="grid-stack-item-content" id="graph_`+conf.graphID+`"></div>
            </div>`);
        }
        
        let local_data = JSON.parse(localStorage.getItem('data_'+device_id));

        number_of_points = parseInt(conf.no_of_points);
        data = [];


        time = [];
        date_time = {};
        series = [];


        conf.keyToPlot.forEach((conf_keyToPlot,i)=>{
            sensor_values = [];
            if(local_data.length>0){
                while(data.length < number_of_points){
                    temp = local_data.pop();
                    if(temp.topic==conf.topicID[i]){
                        data.push(temp);
                    }
                }
            }
            data.reverse();
            data.forEach(entry=>{
                if(entry.topic==conf.topicID[i]){
                    try {
                        payload = JSON.parse(entry.payload);
                        payload = (payload[conf_keyToPlot]*conf.multiplier[i]).toFixed(2);
                        if(entry.topic==conf.topicID[0]){
                            datatime = new Date(entry.received_at).toLocaleTimeString('en-GB');
                            time.push(datatime);
                            date_time[datatime]=entry.received_at;
                        }
                        sensor_values.push(parseFloat(payload));
                    } catch(e) {
                        
                    }
                }
            });
            series.push({
                label:'',
                name: conf_keyToPlot,
                data: sensor_values
            });
        });

        if(local_data.length!=0){
            var monthDateYear = new Date(data[data.length-1].received_at).toLocaleDateString('en-GB', {  
                day : 'numeric',
                month : 'short',
                year : 'numeric'
            });
        }
        else{
            var monthDateYear = '-'
        }
        generateGraph('graph_'+conf.graphID,conf.graphType,time,series,conf.graphID,conf.graphTitle,conf.graphSize,monthDateYear,conf,device_id,date_time);
    }else{
        let current_value = 0;
        let found = false;
        downlinks = JSON.parse(localStorage.getItem('downlinks_'+device_id));
        downlinks.forEach((downlink)=>{
            if(downlink.topic==conf.device_control_topic_id){
                if(downlink.payload.split('=')[0]==conf.device_control_key){
                    found = true;
                    current_value = downlink.payload;
                    current_value = current_value.split('=')[1];
                    current_value = current_value/conf.device_control_multiplier;
                }
            }
        });
        if(page=="configuration"){

            if(conf.type=="toogle-switch"){
                $('#div_main').append(`
                <div class="grid-stack-item" id="`+conf.divID+`" data-gs-x="`+conf.x+`" data-gs-y="`+conf.y+`" data-gs-width="`+conf.width+`" data-gs-height="`+conf.height+`">
                    <div class="grid-stack-item-content" style="background-color:#fff">
                    <div class="row">
                            <div><h3 onclick="delete_device_control(`+conf.divID+`)" style='cursor:pointer;margin-left:5px;'>&times</h3></div>
                            <div><span onclick="edit_device_control(`+conf.divID+`)" style='cursor:pointer;margin-left:5px;'><i style='padding-top:8px;' class="fa fa-edit"></i></span></div>
                        </div>
                        <div class="row">
                            <div class="col-md-12 col-sm-12 col-12">
                                <p class="text-center"><strong>`+conf.device_control_title+`</strong></p>
                            </div>
                        </div> 
                            <div class="row">
                            <div class="col-md-12 col-sm-12 col-12 text-center" id="graph_`+conf.divID+`">
                                <span class="m-3"><strong>0</strong></span>
                                <label class="switch">
                                  <input type="checkbox" onchange="toogle_buttion_clicked(`+device_id+`,`+conf.device_control_topic_id+`,this)" id="`+conf.device_control_key+`">
                                  <span class="slider round"></span>
                                </label>
                                <span class="m-3"><strong>1</strong></span>
                            </div>
                            </div>

                            <div class="row m-5">
                                <div class="col-md-12 col-sm-12 col-12 text-center" style="color:#a4a4a4">
                                    <span>`+conf.device_control_key+` = </span><span id="`+conf.device_control_key+`_value">`+current_value+`</span>
                                </div>
                            </div> 
                            </div>
                </div>`);
                if(current_value==1){
                    $("#"+conf.device_control_key).attr("checked", true);
                }
            }
            else{
                if(found){
                    $('#div_main').append(`
                    <div class="grid-stack-item" id="`+conf.divID+`" data-gs-x="`+conf.x+`" data-gs-y="`+conf.y+`" data-gs-width="`+conf.width+`" data-gs-height="`+conf.height+`">
                        <div class="grid-stack-item-content" style="background-color:#fff">
                        <div class="row">
                            <div><h3 onclick="delete_device_control(`+conf.divID+`)" style='cursor:pointer;margin-left:5px;'>&times</h3></div>
                            <div><span onclick="edit_device_control(`+conf.divID+`)" style='cursor:pointer;margin-left:5px;'><i style='padding-top:8px;' class="fa fa-edit"></i></span></div>
                        </div>
                        <div class="row">
                            <div class="col-md-12 col-sm-12 col-12">
                                <p class="text-center"><strong>`+conf.device_control_title+`</strong></p>
                            </div>
                        </div> 
                            <div class="row">
                            
                            <div class="col-md-12" id="graph_`+conf.divID+`">
                                    <input type="range" value="`+current_value+`" min="`+conf.device_control_min_val+`" max="`+conf.device_control_max_val+`" class="slider2" onchange="slider_changed(`+device_id+`,`+conf.device_control_topic_id+`,this,`+conf.device_control_multiplier+`)" id="`+conf.device_control_key+`">
                                </div>
                            </div>

                            <div class="row m-5">
                                <div class="col-md-12 col-sm-12 col-12 text-center" style="color:#a4a4a4">
                                    <span>`+conf.device_control_key+` = </span><span id="`+conf.device_control_key+`_value">`+current_value+`</span>
                                </div>
                            </div> 
                            </div>
                    `);
                }
                else{
                    $('#div_main').append(`
                    <div class="grid-stack-item" id="`+conf.divID+`" data-gs-x="`+conf.x+`" data-gs-y="`+conf.y+`" data-gs-width="`+conf.width+`" data-gs-height="`+conf.height+`">
                        <div class="grid-stack-item-content" style="background-color:#fff">
                        <div class="row">
                            <div><h3 onclick="delete_device_control(`+conf.divID+`)" style='cursor:pointer;margin-left:5px;'>&times</h3></div>
                            <div><span onclick="edit_device_control(`+conf.divID+`)" style='cursor:pointer;margin-left:5px;'><i style='padding-top:8px;' class="fa fa-edit"></i></span></div>
                        </div>
                        <div class="row">
                            <div class="col-md-12 col-sm-12 col-12">
                                <p class="text-center"><strong>`+conf.device_control_title+`</strong></p>
                            </div>
                        </div> 
                        <div class="">
                            <div class="row">
                            
                            <div class="col-md-12" id="graph_`+conf.divID+`">
                                    <input type="range" value="`+current_value+`" min="`+conf.device_control_min_val+`" max="`+conf.device_control_max_val+`" class="slider2" onchange="slider_changed(`+device_id+`,`+conf.device_control_topic_id+`,this,`+conf.device_control_multiplier+`)" id="`+conf.device_control_key+`">
                                </div>
                            </div>

                            <div class="row m-5">
                                <div class="col-md-12 col-sm-12 col-12 text-center" style="color:#a4a4a4">
                                    <span>`+conf.device_control_key+` = </span><span id="`+conf.device_control_key+`_value">`+conf.device_control_min_val+`</span>
                                </div>
                            </div> 
                        </div>
                        </div>
                    </div>`);
                }
            }
        }
        else{
            if(conf.type=="toogle-switch"){
                $('#div_main').append(`
                <div class="grid-stack-item" data-gs-no-resize="true" data-gs-no-move="true" id="`+conf.divID+`" data-gs-x="`+conf.x+`" data-gs-y="`+conf.y+`" data-gs-width="`+conf.width+`" data-gs-height="`+conf.height+`">
                    <div class="grid-stack-item-content" style="background-color:#fff">
                    <div class="row"></div>
                        <div class="row">
                            <div class="col-md-12 col-sm-12 col-12" style="margin-top:10px;">
                                <p class="text-center"><strong>`+conf.device_control_title+`</strong></p>
                            </div>
                        </div> 
                            <div class="row">
                            <div class="col-md-12 col-sm-12 col-12 text-center" id="graph_`+conf.divID+`">
                                <span class="m-3"><strong>0</strong></span>
                                <label class="switch">
                                  <input type="checkbox" onchange="toogle_buttion_clicked(`+device_id+`,`+conf.device_control_topic_id+`,this)" id="`+conf.device_control_key+`">
                                  <span class="slider round"></span>
                                </label>
                                <span class="m-3"><strong>1</strong></span>
                            </div>
                            </div>

                            <div class="row m-5">
                                <div class="col-md-12 col-sm-12 col-12 text-center" style="color:#a4a4a4">
                                    <span>`+conf.device_control_key+` = </span><span id="`+conf.device_control_key+`_value">`+current_value+`</span>
                                </div>
                            </div> 
                            </div>
                </div>`);
                if(current_value==1){
                    $("#"+conf.device_control_key).attr("checked", true);
                }
            }
            else{
                if(found){
                    $('#div_main').append(`
                    <div class="grid-stack-item" data-gs-no-resize="true" data-gs-no-move="true" id="`+conf.divID+`" data-gs-x="`+conf.x+`" data-gs-y="`+conf.y+`" data-gs-width="`+conf.width+`" data-gs-height="`+conf.height+`">
                        <div class="grid-stack-item-content" style="background-color:#fff">
                        <div class="row"></div>
                        <div class="row">
                            <div class="col-md-12 col-sm-12 col-12" style="margin-top:10px;">
                                <p class="text-center"><strong>`+conf.device_control_title+`</strong></p>
                            </div>
                        </div> 
                            <div class="row">
                            
                            <div class="col-md-12" id="graph_`+conf.divID+`">
                                    <input type="range" value="`+current_value+`" min="`+conf.device_control_min_val+`" max="`+conf.device_control_max_val+`" class="slider2" onchange="slider_changed(`+device_id+`,`+conf.device_control_topic_id+`,this,`+conf.device_control_multiplier+`)" id="`+conf.device_control_key+`">
                                </div>
                            </div>

                            <div class="row m-5">
                                <div class="col-md-12 col-sm-12 col-12 text-center" style="color:#a4a4a4">
                                    <span>`+conf.device_control_key+` = </span><span id="`+conf.device_control_key+`_value">`+current_value+`</span>
                                </div>
                            </div> 
                            </div>
                    `);
                }
                else{
                    $('#div_main').append(`
                    <div class="grid-stack-item" data-gs-no-resize="true" data-gs-no-move="true" id="`+conf.divID+`" data-gs-x="`+conf.x+`" data-gs-y="`+conf.y+`" data-gs-width="`+conf.width+`" data-gs-height="`+conf.height+`">
                        <div class="grid-stack-item-content" style="background-color:#fff">
                        <div class="row"></div>
                        <div class="row">
                            <div class="col-md-12 col-sm-12 col-12" style="margin-top:10px;">
                                <p class="text-center"><strong>`+conf.device_control_title+`</strong></p>
                            </div>
                        </div> 
                        <div class="">
                            <div class="row">
                            
                            <div class="col-md-12" id="graph_`+conf.divID+`">
                                    <input type="range" value="`+current_value+`" min="`+conf.device_control_min_val+`" max="`+conf.device_control_max_val+`" class="slider2" onchange="slider_changed(`+device_id+`,`+conf.device_control_topic_id+`,this,`+conf.device_control_multiplier+`)" id="`+conf.device_control_key+`">
                                </div>
                            </div>

                            <div class="row m-5">
                                <div class="col-md-12 col-sm-12 col-12 text-center" style="color:#a4a4a4">
                                    <span>`+conf.device_control_key+` = </span><span id="`+conf.device_control_key+`_value">`+conf.device_control_min_val+`</span>
                                </div>
                            </div> 
                        </div>
                        </div>
                    </div>`);
                }
            }
        }
    }
}
function toogle_buttion_clicked(device_id,topic,e){
    //$("#"+e.id).parent().addClass("underprocess");

    $("#"+e.id).nextUntil('.span').addClass("underprocess");
    toogle_last_click = new Date();
    toogle_last_click = toogle_last_click.getTime();
    var output = document.getElementById(e.id+"_value");
    if(e.checked){
        new_value = e.id+'=1';
        output.innerHTML = 1;
    }
    else{
        new_value = e.id+'=0';
        output.innerHTML = 0;
    }
    setTimeout(function(){
        let now_time = new Date();
        now_time = now_time.getTime();
        let interval = toogle_last_click + (5000);
        if(interval<=now_time){
            downlinks = JSON.parse(localStorage.getItem('downlinks_'+device_id));
            downlinks.forEach((downlink,i)=>{
                if(downlink.topic==topic){
                    downlinks[i].payload = new_value;
                }
            });
            localStorage.setItem('downlinks_'+device_id,JSON.stringify(downlinks));
            $.ajax({
                url: "https://console.axino.co/api/v2/downlinks?access_token="+localStorage.getItem('token')+"&device_id="+device_id,
                type: 'POST',
                "data": {
                    "payload": Base64.encode(new_value),
                    "topic": topic,
                },
                success: function (data) {
                    if(data == "message qued"){
                        setTimeout(function(){ get_latest_downlinks(device_id); }, 10000);
                    }
                    else{
                        $("#"+e.id).parent().addClass("underprocess");
                    }
                },
                error: function (err) {
                    console.log(err);
                    alert_message('Unable to access device','warning',3000);
                }
            });
        }
    },5000);
}

function slider_changed(device_id,topic,e,multiplier){
    $("#"+e.id).addClass("underprocess");
    slider_last_click = new Date();
    slider_last_click = slider_last_click.getTime();
    var slider = document.getElementById(e.id);
    var output = document.getElementById(e.id+"_value");
    output.innerHTML = slider.value;
    setTimeout(function(){
        let now_time = new Date();
        now_time = now_time.getTime();
        let interval = slider_last_click + (5000);

        if(interval<=now_time){
            new_value = e.id+'='+(slider.value*multiplier);
            downlinks = JSON.parse(localStorage.getItem('downlinks_'+device_id));
            downlinks.forEach((downlink,i)=>{
                if(downlink.topic==topic){
                    downlinks[i].payload =  new_value;
                }
            });
            localStorage.setItem('downlinks_'+device_id,JSON.stringify(downlinks));
            $.ajax({
                url: "https://console.axino.co/api/v2/downlinks?access_token="+localStorage.getItem('token')+"&device_id="+device_id,
                type: 'POST',
                "data": {
                    "payload": Base64.encode(new_value),
                    "topic": topic,
                },
                success: function (data) {
                    if(data != "message qued"){
                        $("#"+e.id).attr("disabled", false);
                    }
                    else{
                        setTimeout(function(){ get_latest_downlinks(device_id); }, 10000);
                    }
                },
                error: function (err) {
                    console.log(err);
                    alert_message('Unable to access device','warning',3000);
                }
            });
        }
    },5000);
}


function update_graph(conf,device_id,min=0,max=0){
    if(conf.type=='graph'){
        let local_data = JSON.parse(localStorage.getItem('data_'+device_id));

        min_limit = min || local_data.length - parseInt(conf.no_of_points);
        max_limit = max || local_data.length;
        time = [];
        date_time = {};
        series = [];

        if(min==0){
            data = [];
            number_of_points = parseInt(conf.no_of_points);

            conf.keyToPlot.forEach((conf_keyToPlot,i)=>{
                sensor_values = [];
                if(local_data.length>0){
                    while(data.length < number_of_points){
                        temp = local_data.pop();
                        if(temp.topic==conf.topicID[i]){
                            data.push(temp);
                        }
                    }
                }
                data.reverse();
                data.forEach(entry=>{
                    if(entry.topic==conf.topicID[i]){
                        try {
                            payload = JSON.parse(entry.payload);
                            payload = (payload[conf_keyToPlot]*conf.multiplier[i]).toFixed(2);
                            if(entry.topic==conf.topicID[0]){
                                datatime = new Date(entry.received_at).toLocaleTimeString('en-GB');
                                time.push(datatime);
                                date_time[datatime]=entry.received_at;
                            }
                            sensor_values.push(parseFloat(payload));
                        } catch(e) {
                            
                        }
                    }
                });
                series.push({
                    name: conf_keyToPlot,
                    data: sensor_values
                });
            });
        }
        else{

            data = local_data.slice(min_limit,max_limit);
            conf.keyToPlot.forEach((conf_keyToPlot,i)=>{
                sensor_values = [];
                data.forEach(entry=>{
                    if(entry.topic==conf.topicID[i]){
                        try {
                            payload= JSON.parse(entry.payload);
                            payload = (payload[conf_keyToPlot]*conf.multiplier[i]).toFixed(2);

                            if(entry.topic==conf.topicID[0]){
                                datatime = new Date(entry.received_at).toLocaleTimeString('en-GB');
                                time.push(datatime);
                                date_time[datatime]=entry.received_at;
                            }
                            sensor_values.push(parseFloat(payload));
                        } catch(e) {
                            
                        }
                    }
                });
                series.push({
                    name: conf_keyToPlot,
                    data: sensor_values
                });
            });
        }


        
        if(series[0].data.length>0){
           if(local_data.length!=0){
                var monthDateYear = new Date(data[data.length-1].received_at).toLocaleDateString('en-GB', {  
                    day : 'numeric',
                    month : 'short',
                    year : 'numeric'
                });
                all_chart[conf.graphID].setTitle(null, { text: "("+monthDateYear+")"});
            }
            else{
                var monthDateYear = '-';
                all_chart[conf.graphID].setTitle(null, { text: '-'});
            }
             
            if(conf.graphType=="gauge-activity-default"){
                i = 0;
                series.forEach(serie=>{
                    try {
                        all_chart[conf.graphID].series[i].points[0].update(series[i].data.pop());
                    } catch(e) {
                        
                    }
                    i++;
                })
            }
            else if(conf.graphType=="gauge-solid-default"||conf.graphType=="gauge-speedometer-default"){
                try {
                    all_chart[conf.graphID].series[0].points[0].update(series[0].data.pop());
                } catch(e) {
                    
                }
            }
            else if(conf.graphType=="line-time-series-default"){
                try {
                    all_chart[conf.graphID].series[0].update({
                        data: series[0].data
                    }, true);
                } catch(e) {
                    
                }
            }
            else{
                i = 0;
                try {
                    series.forEach(serie=>{
                    all_chart[conf.graphID].series[i].update({
                        data: series[i].data
                        }, true);
                        i++;
                    });
                } catch(e) {
                    
                }
            }

            all_chart[conf.graphID].xAxis[0].update({categories:time}, true); 
        }
        else{
            if(min!=0){
                alert('invalid or no more data to display');
            }
        }
        
    }
    else{
        let current_value = 0;
        downlinks = JSON.parse(localStorage.getItem('downlinks_'+device_id));
        downlinks.forEach((downlink)=>{
            if(downlink.topic==conf.device_control_topic_id){
                try {
                    if(downlink.payload.split('=')[0]==conf.device_control_key){
                        current_value = downlink.payload;
                        current_value = current_value.split('=')[1];
                        current_value = current_value/conf.device_control_multiplier;
                        if(downlink.status){
                            if(conf.type=="toogle-switch"){
                               $("#"+conf.device_control_key).nextUntil('.span').removeClass("underprocess");
                            }
                            else{
                                $("#"+conf.device_control_key).removeClass("underprocess");
                            }
                        }
                        else{
                            if(conf.type=="toogle-switch"){
                               $("#"+conf.device_control_key).nextUntil('.span').addClass("underprocess");
                            }
                            else{
                                $("#"+conf.device_control_key).addClass("underprocess");
                            }
                        }
                    }

                } catch(e) {
                    
                }
            }
        });
        if(conf.type=="toogle-switch"){
            if(current_value==1){
                $("#"+conf.device_control_key).attr("checked", true);
            }
            else{
                $("#"+conf.device_control_key).attr("checked", false);
            }
        }
        else{
            $("#"+conf.device_control_key).val(current_value);
            $("#"+conf.device_control_key+"_value").html(current_value);
        }
    }
}

function alert_message(text,type='info',time=0){
    $('.alert').attr('style','display:block');
    $('.alert').addClass(type);
    $('.alert').html(`<span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span>`+text+``);
    if(time!=0){
        setTimeout(function(){$('.alert').attr('style','display:none');},time);
    }
}

let grid_stack = $('.grid-stack');

grid_stack.on('change', function (event, items) {
    device_conf = JSON.parse(localStorage.getItem('device_conf'));
    device_conf.forEach(function(conf,i){
        
        if(conf.type == 'graph'){
            if(conf.graphID==items[0].el[0].id){
                device_conf[i].x = items[0].x;
                device_conf[i].y = items[0].y;
                device_conf[i].width = items[0].width;
                device_conf[i].height = items[0].height;
            }
        }
        else{

                console.log(items[0]);
            if(conf.divID==items[0].el[0].id){
                device_conf[i].x = items[0].x;
                device_conf[i].y = items[0].y;
                device_conf[i].width = items[0].width;
                device_conf[i].height = items[0].height;
            }
        }
    });
    Highcharts.charts.forEach(chart=>{
        chart.reflow();
        try{
            function noop(){}
            chart['left_'+chart.id].destroy();
            chart['right_'+chart.id].destroy();
            chart['left_'+chart.id] = chart.renderer.button('<', chart.plotLeft - 75, chart.plotHeight-100 + chart.plotTop, noop).addClass('left_'+chart.id).add();
            chart['right_'+chart.id] = chart.renderer.button('>', chart.plotLeft + chart.plotWidth + 20, chart.plotHeight + chart.plotTop-100, noop).addClass('right_'+chart.id).add();
        }
        catch(error){
            console.log(error);
        }
    });
    localStorage.setItem('device_conf',JSON.stringify(device_conf));
});
