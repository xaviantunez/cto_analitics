const alevinB = [
    'Ivor', 'Alexis', 'Aleix', 'Arnau_GE', 'Carles', 'Dario',
    'Gabriel', 'Hector', 'Joan',
    'Maia', 'Marc_Iborra','Oscar', 'Andreu', 'Arnau_GLL', 'Brais', 'Carlos',
    'Guillem',  'Leo',
    'Mateo', 'Miguel',
    'Victor'];
const alevinA = [
    'Pablo','Ianis','Dani_Lopez', 'Dani_Ortega','Cristian','Maxim', 'Ruben','Andreu', 'Brais',
    'Hugo', 'Manel', 'Marc_Colom', 'Mateo', 'Guillem', 'Leo', 'Arnau_GLL','Carlos','Victor'
];

const benjaminA = [
];
const benjaminB = ["Adomas Volskis", "Saul_Costa", "Sergi_Climent", "Mario_Mas", "Oliver_Mas", "Leo_Barreres", "Marti_Veiguela",
    "Joan_Barber","Marco_Gomez","Edu_Mena","Aritz_Salinas","Leo_Perez"
];
const alevinF = [
];
const prebenjaminA = ["Romeo_Morganti",
    "Leo_Pérez","Aitor_Martin","Andreu_Romero",
    "Marti_Romero","Joan_Colom","Iulian_Moldovan","Marco_Valbuena",
    "Julen_Mena","Artur_Vicens","Sergio_Costa","Jaume_Millet","Patrice_Carbila",
    "Joan_Ponsoda"
];
const infantilA = [];
const infantilB = [];
const infantilF = [];
const cadeteA = [];
const cadeteB = [];
const cadeteF = [];
const juvenilA = [];
const juvenilB = [];
const juvenilF = [];
const equips =["prebenjaminA","benjaminB","benjaminA","alevinF","alevinB","alevinA","infantilA","infantilB","infantilF","cadeteF","cadeteB","cadeteA","juvenilA","juvenilB","juvenilF"];

$(document).ready(function() {
    var myBarChart;
    var first=true;
    var adversario="Adversario";
    var iniciado=false;
    var enmarcha=0;
    var totaljugadoresencampo=0;
    var totalTiempo;
    var iniTiempo=0;
    var arraycheckeados=[];
    var checkeadosrecuperados=[];
    var intervalos = {}; // Almacenará los intervalos individuales de cada cronómetro
    var tiempos = {}; // Almacenará el tiempo acumulado de cada cronómetro
    var marcatiempo={};
    var marcatiempoTotal=0;
    var marcatiempototalDate=0;
    var mensajes={};
    var marcamensajes={};
    var mensajestablaMarcador=[];
    var nombresCronometros=[];
    var equipoElegido;
    var pdfParte='Primera Parte ';
    var tiempopartido=1;
    var capitan="";
    var equipotitular=[];

    equips.forEach(function(nombre, index) {
        //alert(nombre);
        $("#equipos").append("<option value='"+nombre+"'>"+nombre+"</option>");
    });


    //const { prebenjaminA, benjaminB, benjaminA, alevinF, alevinB, alevinA, infantilA, cadeteF, cadeteA, juevenilA  } = require('./equipos.js');

   
    var arrayestadisticas=["rematesFuera","rematesPorteria","paradasPortero","cornersFavor","fuerasJuego","faltasCometidas","tarjetasAmarillas","tarjetasRojas"];
    // Intentamos cargar los datos de tiempos desde localStorage si existen
    if (localStorage.getItem('tiempos')) {
        //esconder el select de e3quipos
        $('#divequipos').hide();
        $('#add-rival-div').hide();
        //-----------------------
        tiempos = JSON.parse(localStorage.getItem('tiempos'));
        iniTiempo = JSON.parse(localStorage.getItem('tiempototal'));
        marcatiempoTotal = JSON.parse(localStorage.getItem('marcatiempototal'));
        marcatiempototalDate = JSON.parse(localStorage.getItem('marcatiempototaldate'));
        adversario = JSON.parse(localStorage.getItem('adversario'));
        capitan = JSON.parse(localStorage.getItem('capitan'))
        equipotitular=JSON.parse(localStorage.getItem('equipotitular'));
        enmarcha=JSON.parse(localStorage.getItem('iniciado'));
        marcatiempo=JSON.parse(localStorage.getItem('marcatiempo'));
        marcamensajes=JSON.parse(localStorage.getItem('marcamensajes'));
        mensajes=JSON.parse(localStorage.getItem('mensajes'));
        mensajestablaMarcador=JSON.parse(localStorage.getItem('mensajestablamarcador'));
        equipoElegido=JSON.parse(localStorage.getItem('equipoElegido'));
        portero=JSON.parse(localStorage.getItem('portero'));
        if(enmarcha=="") enmarcha=0;
        if(mensajes == null) mensajes={};
        if(marcamensajes == null) marcamensajes={};

        var nombresCronometrosTemp =JSON.parse(localStorage.getItem('nombresCronometros'));
        if(nombresCronometrosTemp){
            nombresCronometros=nombresCronometrosTemp;
        }
        if(!adversario){
            $('#id2 span').text("Adversario");
        }else{
            $('#id2 span').text(adversario);
        }
        var resulAdv = JSON.parse(localStorage.getItem('resulAdv'));
        var resulCto = JSON.parse(localStorage.getItem('resulCto'));
        //------------------------------------------------------------------
        cargarestadistica("left");
        cargarestadistica("right");
        //------------------------------------------------------------------
        $('#resulAdv').text(resulAdv);
        $('#resulCto').text(resulCto);
    }else{
        if(!equipoElegido){
            console.log("No hay equipo elegido");
            nombresCronometros=alevinA ;
            //hay que poner el selected al option

        }

    }
    mostrarplantilla(); // Muestra la plantilla inicial con todos los cronómetros
    ajustarMensajeTablaMarcador();
    if(enmarcha==1){
        //
        ajustaCronometros()
        iniciar();

    }
        // Iniciar todos los cronómetros si están marcados
    $('#iniciar-todos').click(function() {
        iniciar();
    });

    function iniciar(){
        var texto="";
        if(totaljugadoresencampo<8){
            alert('SOLO TIENES '+totaljugadoresencampo+" JUGADORES SELECCIONADOS\n\nPOR FAVOR REVISALO");
            return
        }
        if(!iniciado){
            iniciartotaltiempo();
            iniciado=true;
            $('#divequipos').hide();
            $('#divnewplayer').hide();
            $('.checkboxplayers').prop('disabled', true);
            $('.buttondelete').hide();
            $('.checkboxportero').hide();
            $('.spanportero').hide();
            $('.spantitulos').hide();


            localStorage.setItem('equipotitular',JSON.stringify(equipotitular));
            localStorage.setItem('resulAdv', JSON.stringify(0));
            localStorage.setItem('resulCto', JSON.stringify(0));
            localStorage.setItem('nombresCronometros', JSON.stringify(nombresCronometros));
            localStorage.setItem('iniciado', JSON.stringify(1));

        }
        $('#suplentes').empty();
        for (var i = 0; i < nombresCronometros.length; i++) {
            var jugador = nombresCronometros[i];
            if ($("#check" + jugador).is(':checked')) {
                iniciarCronometro(jugador);
                $("#SP"+jugador).show();
                if(texto=="") texto="Equipo en el campo: "+jugador
                else texto+=", "+jugador+' '
                console.log('jugador' +jugador+' '+$("#pcheck" + jugador).is(':checked'));
                if ($("#pcheck" + jugador).is(':checked')) {
                    localStorage.setItem('portero', JSON.stringify(jugador));
                    $("#TP"+jugador).show();
                    $("#PA"+jugador).show();
                    $("#AS"+jugador).hide();
                    $("#GO"+jugador).hide();
                    $("#RF"+jugador).hide();
                    $("#RD"+jugador).hide();
                    $("#TA"+jugador).show();
                    $("#TR"+jugador).show();
                    $('.spantitulos').show();

                }

            }else{
                $('#suplentes').append($('<div class="reservas">').text(jugador));

                $("#AS"+jugador).show();
                $("#GO"+jugador).show();
                $("#RF"+jugador).show();
                $("#RD"+jugador).show();
                $("#TA"+jugador).show();
                $("#TR"+jugador).show();
                $("#TP"+jugador).hide();
                $("#PA"+jugador).hide();
                $("#SP"+jugador).hide();

            }
            showTimeColor(tiempos[jugador],jugador,true);
            console.log(tiempos[jugador]+" "+jugador);
        }
        if(enmarcha==0)mensajeTablaMarcador(texto);
    }

    function cargarestadistica(columna) {
        $('#divestadisticas .numestadisticas'+columna).each(function(index, item) {
            var estadistica=JSON.parse(localStorage.getItem(arrayestadisticas[index]+columna));
            if(estadistica){
                $(this).text(estadistica); 
            }else{
                $(this).text(0); 
            }
        });
    }

    function removeestadisticas() {
        arrayestadisticas.forEach(function (estadistica) {
            localStorage.removeItem(estadistica+'left');
            localStorage.removeItem(estadistica+'right');
        });
        $('#divestadisticas .numestadisticasleft').each(function(index, item) {
            $(this).text(0); 
        });
        $('#divestadisticas .numestadisticasright').each(function(index, item) {
            $(this).text(0); 
        });
    }
    function fechaHora() {
        let ahora = new Date();

        // Obtener los componentes de la fecha
        let dia = ahora.getDate();
        let mes = ahora.getMonth() + 1; // Enero es 0
        let anio = ahora.getFullYear();

        // Obtener los componentes de la hora
        let horas = ahora.getHours();
        let minutos = ahora.getMinutes();
        let segundos = ahora.getSeconds();

        // Asegurar que los números sean de dos dígitos
        mes = mes < 10 ? "0" + mes : mes;
        dia = dia < 10 ? "0" + dia : dia;
        horas = horas < 10 ? "0" + horas : horas;
        minutos = minutos < 10 ? "0" + minutos : minutos;
        segundos = segundos < 10 ? "0" + segundos : segundos;

        let cadena = `${dia}/${mes}/${anio} ${horas}:${minutos}:${segundos}`;

        // Mostrar la fecha y hora en el elemento con id "fecha-hora"
        return cadena;
    }

    function iniciartotaltiempo(){
        if(marcatiempototalDate==null || marcatiempototalDate==0)
        {
            marcatiempototalDate = fechaHora();
            localStorage.setItem('marcatiempototaldate', JSON.stringify(marcatiempototalDate));
            mensajeTablaMarcador('INICIO TIEMPO TOTAL');
        }
        totalTiempo = setInterval(function() {
            if((Math.floor(Date.now() / 1000)-marcatiempoTotal)>2 && marcatiempoTotal>0){
                iniTiempo+=Math.floor(Date.now() / 1000)-marcatiempoTotal;
            }
            else iniTiempo++;
            const minutosTotales = Math.floor(iniTiempo / 60);
            const segundosTotales = iniTiempo % 60;

            localStorage.setItem('tiempototal', JSON.stringify(iniTiempo));
            marcatiempoTotal = Math.floor(Date.now() / 1000);
            localStorage.setItem('marcatiempototal', JSON.stringify(marcatiempoTotal));
            $(`#time0`).text(`${minutosTotales}:${segundosTotales < 10 ? '0' : ''}${segundosTotales}`+'  ('+marcatiempototalDate+')');
            }, 1000);

    }

    function showTimeColor(tiempo, jugador,arranque=false){
        var clase='rojo';
        if(tiempo>600 && tiempo<1500 ){
            clase='naranja';
            $("#ES"+jugador).removeClass("rojo");

        }
        if(tiempo>1500 ) {
            clase = 'verde';
            $("#ES"+jugador).removeClass("naranja");
            $("#ES"+jugador).removeClass("rojo");
        }

        if(!arranque) $("#ES"+jugador).toggleClass(clase);
        else $("#ES"+jugador).addClass(clase);
        //console.log(jugador+' '+tiempo);

    }

    function ajustaCronometros(){
        var primero=true;
        for (var i = 0; i < nombresCronometros.length; i++) {
            var jugador = nombresCronometros[i];
            if ($("#check" + jugador).is(':checked')) {
                if(marcatiempo !=null) {
                    if(marcatiempo[jugador]!=null) {
                        tiempos[jugador] += Math.floor(Date.now() / 1000) - marcatiempo[jugador];
                        marcatiempo[jugador] = Math.floor(Date.now() / 1000);
                    }
                }
            }
        }
        localStorage.setItem('tiempos', JSON.stringify(tiempos));

        console.log("ajustar Tiempo Total " +marcatiempoTotal);
        if(marcatiempoTotal != null) {
            iniTiempo += Math.floor(Date.now() / 1000) - marcatiempoTotal;
            localStorage.setItem('tiempototal', JSON.stringify(iniTiempo));
            marcatiempoTotal = Math.floor(Date.now() / 1000);
        }

    }

    // Crear el intervalo para cada cronómetro
    function crearIntervalo(jugador) {
        if (!tiempos[jugador]) {
            tiempos[jugador] = 0;
        }
        if ($("#check" + jugador).is(':checked')) {
            $("#cronometros").prepend($("#"+jugador));
            arraycheckeados.push(jugador);
            localStorage.setItem('checkeados', JSON.stringify(arraycheckeados));
            intervalos[jugador] = setInterval(function() {
            tiempos[jugador]++;
            showTimeColor(tiempos[jugador],jugador);
            const minutos = Math.floor(tiempos[jugador] / 60);
            const segundos = tiempos[jugador] % 60;
            
            $("#time" + jugador).text(`${minutos}:${segundos < 10 ? '0' : ''}${segundos}`);
                if((Math.floor(Date.now() / 1000)-marcatiempo[jugador])>2){
                    //if(primero==false) tiempos[jugador]+=Math.floor(Date.now() / 1000)-marcatiempo[jugador];
                    tiempos[jugador]+=Math.floor(Date.now() / 1000)-marcatiempo[jugador];
                }
                localStorage.setItem('tiempos', JSON.stringify(tiempos));
                marcatiempo[jugador] = Math.floor(Date.now() / 1000);
                localStorage.setItem('marcatiempo', JSON.stringify(marcatiempo));

                //timeout para hacer desaparecer el mensaje
                if(mensajes != null){
                    if(mensajes[jugador]!=null){
                        if(Math.floor(Date.now() / 1000)-marcamensajes[jugador]>5){
                            mensajes[jugador]="";
                            marcamensajes[jugador]="";
                            localStorage.setItem('marcamensajes', JSON.stringify(marcamensajes));
                            localStorage.setItem('mensajes', JSON.stringify(mensajes));
                            $("#INFO"+jugador).text("");
                        }
                    }
                }
            }, 1000); 
        }
    }
    // Función para iniciar el cronómetro de un jugador
    function iniciarCronometro(jugador) {
        if (!intervalos[jugador]) { // Solo inicia el cronómetro si no está corriendo
            crearIntervalo(jugador);
        }
    }

    function pararIntervalos() {
        for (var jugador in intervalos) {
            clearInterval(intervalos[jugador]);
            delete intervalos[jugador];
        }
        localStorage.setItem('tiempos', JSON.stringify(tiempos));
    }

    function reiniciarIntervalos() {
        //addeventchange();
        $('#divequipos').show();
        $('#add-rival-div').show();
        $('#divnewplayer').show();

        $("#time0").text("0:00");
        clearInterval(totalTiempo);   
        iniTiempo=0; 
        pdfParte="Primera Parte "
        pararIntervalos();
        //console.log("reiniciarIntervalos ");
        localStorage.removeItem('checkeados');

        localStorage.removeItem('tiempos');
        localStorage.removeItem('tiempototal');
        localStorage.removeItem('adversario');
        localStorage.removeItem('equipoelegido');
        localStorage.removeItem('resulCto');
        localStorage.removeItem('resulAdv');
        localStorage.removeItem('capitan');
        localStorage.removeItem('iniciado');
        localStorage.removeItem('marcatiempo');
        localStorage.removeItem('marcamensajes');
        localStorage.removeItem('mensajes');
        localStorage.removeItem('marcatiempototal');
        localStorage.removeItem('marcatiempototaldate');
        localStorage.removeItem('mensajestablamarcador');
        localStorage.removeItem('portero');



        for (var i = 0; i < nombresCronometros.length; i++) {
            //console.log("array  "+nombresCronometros[i]);
            var jugador=nombresCronometros[i];
            $("#time" + jugador).text("0:00");
            tiempos[jugador]=0;
        }
        removeestadisticas();
        totaljugadoresencampo=0;
        $('#jugjugando').text(totaljugadoresencampo);
        $('#id2 span').text("Adversario");
        $('#resulAdv').text(0);
        $('#resulCto').text(0);
        $('#suplentes').empty();
        $('#tablaMarcador tr').not(':eq(0), :eq(1)').remove();
        $(".checkboxplayers").prop('checked', false);
        $("#cronometros").empty();
        localStorage.removeItem('nombresCronometros');
        localStorage.removeItem('equipotitular');
        //window.location.reload()

        mostrarplantilla();


    }

    function cambiarJugador(val){

        $('#jugadores-en-juego').empty();
        $('#jugadores-fuera-juego').empty();
        //$('#suplentes').empty();
        for (var i = 0; i < nombresCronometros.length; i++) {
            var jugador = nombresCronometros[i];
            var option = `<option value="${jugador}">${jugador}</option>`;
            if (val==jugador) option = `<option value="${jugador}" selected>${jugador}</option>`;
            if ($("#check" + jugador).is(':checked')) {
                $('#jugadores-en-juego').append(option);
            }else{
                $('#jugadores-fuera-juego').append(option);
            }
        }
        $('#jugadores-modal').show();
    }

    function mostrarplantilla() {
        for (var i = 0; i < nombresCronometros.length; i++) {
            add_fila_player(nombresCronometros,i);
        }
        $('.spanaccion').hide();
        $('.spantitulos').hide();
        checkeadosrecuperados = JSON.parse(localStorage.getItem('checkeados'));
        if(checkeadosrecuperados){
            checkeadosrecuperados = JSON.parse(localStorage.getItem('checkeados'));
            checkeadosrecuperados.forEach(function (nombre) {
               if(nombre==portero) $("#pcheck"+nombre).prop("checked", true);
                $("#check"+nombre).prop("checked", true);
                    totaljugadoresencampo++;
            });
            $('#jugjugando').text(totaljugadoresencampo);
        }
    }

    document.addEventListener("visibilitychange", function() {
        if (document.hidden) {
            console.log("El navegador ha entrado en suspensión.");
        } else {
            console.log("El navegador ha vuelto a estar activo.");
        }
    });

    $(document).on("visibilitychange", function() {
        if (document.hidden) {
            console.log("El navegador está en segundo plano o suspendido.");
        } else {
            console.log("El navegador está activo.");
            window.location.reload();
        }
    });

    $(window).on("blur", function() {
        console.log("El usuario cambió de pestaña o minimizó la app.");
    });

    $(window).on("focus", function() {
        console.log("El usuario volvió a la página.");
        window.location.reload();
    });

    $(document).on('click',".buttondelete", function() {
    //$(".buttondelete").click(function(){
        //console.log($(this).attr("id"));
        var id=$(this).attr("id");
        var nombre=id.substring(12,id.length)
        console.log(nombre);
        var positiontodelete=nombresCronometros.indexOf(nombre);
        nombresCronometros.splice(positiontodelete,1);
        if ($("#check" + nombre).is(':checked')) {
            totaljugadoresencampo--;
            $('#jugjugando').text(totaljugadoresencampo);
        }
        $("#"+nombre).remove();
    });

    function updateVarLocalStorage(storage,iddiv=''){
        if(iddiv=="")iddiv=storage;
        var div=$("#"+iddiv);
        var valor = parseInt(div.text())+1;
        div.text(valor);
        localStorage.setItem(storage, valor);

    }
    function ajustarMensajeTablaMarcador(){
        for (var i = 0; i < mensajestablaMarcador.length; i++) {
            $("#tablaMarcador").append(mensajestablaMarcador[i]);
        }

    }
    function mensajeTablaMarcador(cadena){
        var nuevaFila = "<tr><td>"+fechaHora()+' '+cadena+"</td><td></td></tr>";
        mensajestablaMarcador.push(nuevaFila);
        $("#tablaMarcador").append(nuevaFila);
        localStorage.setItem('mensajestablamarcador',JSON.stringify(mensajestablaMarcador));
    }

	$(document).on('click',".buttonaccion", function() {
    //$(".buttondelete").click(function(){
        //console.log($(this).attr("id"));
        var id=$(this).attr("id");
        var nombre=id.substring(2,id.length)
        var accion=id.substring(0,2)
        //Recoger minuto del partido
        const minutosTotales = Math.floor(iniTiempo / 60);
        if(accion=="AS"){
            var texto = "Asistencia:"+nombre+" min "+minutosTotales+"";
        }
        if(accion=="GO"){
            updateVarLocalStorage('resulCto');
            var texto = "Gol: "+nombre+" min "+minutosTotales+"";
        }
        if(accion=="FH"){
            var texto = "Hace Falta: "+nombre+" min "+minutosTotales+"";
            updateVarLocalStorage('faltasCometidasright','faltasRight');
        }
        if(accion=="FR"){
            var texto = "Recibe Falta: "+nombre+" min "+minutosTotales+"";
            updateVarLocalStorage('faltasCometidasleft','faltasLeft');
        }
        if(accion=="RD"){
            var texto = "Remate Dentro: "+nombre+" min "+minutosTotales+"";
            updateVarLocalStorage('rematesPorterialeft','rematesPorteriaLeft');
        }
        if(accion=="RF"){
            var texto = "Remate Fuera: "+nombre+" min "+minutosTotales+"";
            updateVarLocalStorage('rematesFueraleft','rematesFueraLeft');
        }
        if(accion=="TA"){
            var texto = "Tarjeta Amarilla: "+nombre+" min "+minutosTotales+"";
            updateVarLocalStorage('tarjetasAmarillasleft','tarjetasAmarillasLeft');
        }
        if(accion=="TR"){
            var texto = "Tarjeta Roja: "+nombre+" min "+minutosTotales+"";
            updateVarLocalStorage('tarjetasRojasleft','tarjetasRojasLeft');
        }
        if(accion=="PA"){
            var texto = "Parada: "+nombre+" min "+minutosTotales+"";
            updateVarLocalStorage('paradasPorteroleft','paradasPorteroLeft');
            updateVarLocalStorage('rematesPorteriaright','rematesPorteriaRight');
        }
        if(accion=="TP"){
            var texto = "Rival tira a puerta: "+nombre+" min "+minutosTotales+"";
            updateVarLocalStorage('rematesFueraright','rematesFueraRight');
        }
        //alert(texto);
        $("#INFO"+nombre).text(" "+texto.slice(0,texto.indexOf(":")));
        
        mensajes[nombre]=texto.slice(0,texto.indexOf(":"));
        marcamensajes[nombre]= Math.floor(Date.now() / 1000);
        localStorage.setItem('marcamensajes', JSON.stringify(marcamensajes));
        localStorage.setItem('mensajes', JSON.stringify(mensajes));
        mensajeTablaMarcador(texto);





        /*console.log(nombre);
        var positiontodelete=nombresCronometros.indexOf(nombre);
        nombresCronometros.splice(positiontodelete,1);
        if ($("#check" + nombre).is(':checked')) {
            totaljugadoresencampo--;
            $('#jugjugando').text(totaljugadoresencampo);
        }
        $("#"+nombre).remove();*/
    });
    function add_fila_player(nombresCronometros,i){
        //console.log(i+" "+nombresCronometros[i]+" desde add_fila_player");
        var midiv = $("<div>");
            midiv.attr("id", nombresCronometros[i]);
            midiv.attr("class", "cronometro");
            var spanjugador = $("<span>");
            var spanbotones = $("<span>");
            var spanfaltas = $("<div>");
            var spanremates = $("<div>");
            var spantarjetas = $("<div>");

            var spantiempo = $("<span>");
            var checkbox = $("<input>");
            var buttondelete =$("<button>")
            var buttonF =$("<button>")
            var span1 = $("<span style='color: transparent; !important'>");
            var span11 = $("<span>");
            var span2 = $("<span>");
            var span3 = $("<span>");
            //CODIGO POR COLORES DEL TIEMPO JUGADO
            span1.attr("id","ES"+nombresCronometros[i]);
            span1.text("H");
            //MENU ACCIONES RAPIDAS POR JUGADOR

            span2.attr("class","spanaccion");
            span2.attr("id","SP"+nombresCronometros[i]);
            span3.attr("id","INFO"+nombresCronometros[i]);

            //FALTA HECHA
			buttonF.text("HACE");
			buttonF.attr("class","buttonaccion");
			buttonF.attr("id","FH"+nombresCronometros[i]);
            //FALTA RECIBIDA
            var buttonFR =$("<button>")
			buttonFR.text("SUFRE");
			buttonFR.attr("class","buttonaccion");
			buttonFR.attr("id","FR"+nombresCronometros[i]);
            //ASISTENCIA
			var buttonA =$("<button>")
			buttonA.text("ASISTE");
			buttonA.attr("class","buttonaccion");
			buttonA.attr("id","AS"+nombresCronometros[i]);
            //REMATE DENTRO DE LOS 3 PALOS
			var buttonR =$("<button>")
			buttonR.text("DENTRO");
			buttonR.attr("class","buttonaccion");
			buttonR.attr("id","RD"+nombresCronometros[i]);
            //REMATE FUERA
            var buttonRF =$("<button>")
			buttonRF.text("FUERA");
			buttonRF.attr("class","buttonaccion");
			buttonRF.attr("id","RF"+nombresCronometros[i]);
			var buttonG =$("<button>")
            //GOL
			buttonG.text("GOL");
			buttonG.attr("class","buttonaccion");
			buttonG.attr("id","GO"+nombresCronometros[i]);
            //PARADA DEL PORTERO
            var buttonP =$("<button>")
			buttonP.text("PARA");
			buttonP.attr("class","buttonaccion");
			buttonP.attr("id","PA"+nombresCronometros[i]);
            buttonP.hide();
            var buttonTP =$("<button>")
			buttonTP.text("A PUERTA");
			buttonTP.attr("class","buttonaccion");
			buttonTP.attr("id","TP"+nombresCronometros[i]);
			buttonTP.hide();

            var buttonTA =$("<button>")
            buttonTA.text("AMA");
            buttonTA.attr("class","buttonaccion amarillo");
            buttonTA.attr("id","TA"+nombresCronometros[i]);


            var buttonTR =$("<button>")
            buttonTR.text("ROJ");
            buttonTR.attr("class","buttonaccion rojo");
            buttonTR.attr("id","TR"+nombresCronometros[i]);


            checkbox.attr("type", "checkbox");
            checkbox.attr("class", "checkboxplayers");
            checkbox.attr("id", "check" + nombresCronometros[i]);
            //checkbox.attr("onclick", "comprobarcheckbox()");

            buttondelete.attr("id","buttondelete"+nombresCronometros[i]);
            buttondelete.attr("class","buttondelete");
            buttondelete.text("-");

            var checkboxp = $("<input>");
            checkboxp.attr("type", "checkbox");
            checkboxp.attr("class", "checkboxportero");
            checkboxp.attr("id", "pcheck" + nombresCronometros[i]);
            checkboxp.text("portero");
            var spanpuerta = $("<span>");
            spanpuerta.attr("class", "spanportero");
            spanpuerta.attr("id", "puerta" + nombresCronometros[i]);
            spanpuerta.text('Portero');
        //checkbox.attr("onclick", "comprobarcheckbox()");

            spanfaltas.attr("id", "spfaltas" + nombresCronometros[i]);
            spanfaltas.text("FALTAS");
            spanfaltas.attr("class","spanfaltas");

            spanremates.attr("id", "spremates" + nombresCronometros[i]);
            spanremates.text("REMATES");
            spanremates.attr("class","spanremates");
            /*spangoles.attr("id", "spgoles" + nombresCronometros[i]);
            spangoles.text("GOLES ");
            spangoles.attr("class","spangoles");*/
            spantarjetas.attr("id", "sptarjetas" + nombresCronometros[i]);
            spantarjetas.text("TARJETAS");
            spantarjetas.attr("class","spantarjetas");

            spanjugador.attr("id", "name" + nombresCronometros[i]);
            spanjugador.text(nombresCronometros[i]);
            spantiempo.attr("id", "time" + nombresCronometros[i]);
            const minutos = Math.floor(tiempos[nombresCronometros[i]] / 60);
            const segundos = tiempos[nombresCronometros[i]] % 60;
            //console.log("segundos "+segundos);
            if (isNaN(segundos)) {
                console.log("entra per isNaN");
                spantiempo.text("0:00");
            }else{
                console.log("entra per el else");
                spantiempo.text(`${minutos}:${segundos < 10 ? '0' : ''}${segundos}`)
            };
                midiv.append(span1);
                midiv.append(spanjugador);
                midiv.append(checkbox);
                midiv.append(spantiempo);
                midiv.append(span3);
                midiv.append(buttondelete);
                midiv.append(checkboxp);
                midiv.append(spanpuerta);


                var spanbotones = $("<span>");
                spanbotones.attr("id", "spbotones");
                //alert(spanfaltas.innerHTML);
                spanbotones.append(spanfaltas);
                spanbotones.append(buttonF);
                spanbotones.append(buttonFR);

                span2.append(spanbotones);
                var spanbotones = $("<span>");
                spanbotones.attr("id", "spbotones");
                spanbotones.append(spanremates);
                spanbotones.append(buttonR);
                spanbotones.append(buttonRF);
                spanbotones.append(buttonA);
                spanbotones.append(buttonG);
                spanbotones.append(buttonP);
                span2.append(spanbotones);

                var spanbotones = $("<span>");
                spanbotones.attr("id", "spbotones");
                //alert(spanfaltas.innerHTML);
                spanbotones.append(spantarjetas);
                spanbotones.append(buttonTA);
                spanbotones.append(buttonTR);
                span2.append(spanbotones);

                midiv.append(span2);
            $("#cronometros").append(midiv);
    }

    // Evento para el botón de detener todos los cronómetros
    $('#parar-todos').click(function() {
        clearInterval(totalTiempo);
        pararIntervalos(); // Detiene todos los cronómetros
        iniciado=false;
        enmarcha=false;
        $('.spanaccion').hide();
        $('.titulos').hide();
        $('.checkboxportero').show();
        $('.spanportero').show();

        $('.checkboxplayers').prop('disabled', false);
        if(checkeadosrecuperados){
            checkeadosrecuperados.length=0;
        }
        localStorage.setItem('iniciado', JSON.stringify(0));
        marcatiempototalDate=null;
        localStorage.removeItem('marcatiempototaldate');
        //arraycheckeados.length=0;
    });
    // Evento para el botón de reiniciar todos los cronómetros
    $('#reiniciar-todos').click(function() {

        $('#delete-cookies-modal').show();

    });
    $('#eliminarsesion').click(function() {
        reiniciarIntervalos(); // Detiene y reinicia todos los cronómetros
        $('#delete-cookies-modal').hide();
        window.location.reload();

    });
    $('#continuarsesion').click(function() {
        $('#delete-cookies-modal').hide();
    });
    
    $(document).on('click',".reservas", function() {
        cambiarJugador(this.innerHTML);
    });
    $('#cambiar-jugadores').click(function() {
        $('#jugadores-en-juego').empty();
        $('#jugadores-fuera-juego').empty(); 
        for (var i = 0; i < nombresCronometros.length; i++) {
            var jugador = nombresCronometros[i];
            const option = `<option value="${jugador}">${jugador}</option>`;
            if ($("#check" + jugador).is(':checked')) {
                $('#jugadores-en-juego').append(option);
            }else{
                $('#jugadores-fuera-juego').append(option);
            }
        }
        $('#jugadores-modal').show();
    });
    $('#salir-ayuda').click(function() {
        $('#ayuda-modal').hide();
    });
    $('#salir-cambio').click(function() {
        $('#jugadores-modal').hide();
    });
    $('#salir-gol').click(function() {
        $('#goleador-modal').hide();
    });
    $('#salir-gol-adv').click(function() {
        $('#goleador-adv-modal').hide();
    });    
    $('#cambiar-estado').click(function() {

        const jugadorEnJuego = $('#jugadores-en-juego').val();
        const jugadorFueraJuego = $('#jugadores-fuera-juego').val();
        if(jugadorEnJuego){
            clearInterval(intervalos[jugadorEnJuego]);
            delete intervalos[jugadorEnJuego];
            mensajeTablaMarcador('CAMBIO: '+jugadorEnJuego);
            $(`#check${jugadorEnJuego}`).prop('checked', false);
            $("#TP"+jugadorEnJuego).hide();
            $("#PA"+jugadorEnJuego).hide();
            $("#AS"+jugadorEnJuego).show();
            $("#GO"+jugadorEnJuego).show();
            $("#RF"+jugadorEnJuego).show();
            $("#RD"+jugadorEnJuego).show();
            $("#TA"+jugadorEnJuego).show();
            $("#TR"+jugadorEnJuego).show();
            $("#SP"+jugadorEnJuego).hide();

            $("#cronometros").append($("#"+jugadorEnJuego));
            showTimeColor(tiempos[jugadorEnJuego],jugadorEnJuego,true);
        }
        if(jugadorFueraJuego){
            $(`#check${jugadorFueraJuego}`).prop('checked', true);
            var recuperados = JSON.parse(localStorage.getItem('checkeados'));
            if(recuperados){
            // Buscar y eliminar el nombre del array
                var index = recuperados.indexOf(jugadorEnJuego);
                var index2 = arraycheckeados.indexOf(jugadorEnJuego)
                if (index !== -1) {
                    // Si el nombre existe en el array, lo eliminamos
                    recuperados.splice(index, 1);
                    arraycheckeados.splice(index2, 1);
                    // Actualizar el array en localStorage
                    localStorage.setItem("checkeados", JSON.stringify(recuperados));
                    $("#SP"+jugadorFueraJuego).show();
                    mensajeTablaMarcador('ENTRA: '+jugadorFueraJuego);
                    if($("#pcheck"+jugadorFueraJuego).is(":checked")){
                        $("#TP"+jugadorFueraJuego).show();
                        $("#PA"+jugadorFueraJuego).show();
                        $("#AS"+jugadorFueraJuego).hide();
                        $("#GO"+jugadorFueraJuego).hide();
                        $("#RF"+jugadorFueraJuego).hide();
                        $("#RD"+jugadorFueraJuego).hide();
                        $("#TA"+jugadorFueraJuego).show();
                        $("#TR"+jugadorFueraJuego).show();
                        $('.spantitulos').hide();
                    }
                }
            }
            crearIntervalo(jugadorFueraJuego);
            $("#cronometros").prepend($("#"+jugadorFueraJuego));
        }

        $('#jugadores-modal').hide();
        $('#suplentes').empty();   
        for (var i = 0; i < nombresCronometros.length; i++) {
            var jugador = nombresCronometros[i];
            if (!$("#check" + jugador).is(':checked')) {
                 $('#suplentes').append($('<div class="reservas">').text(jugador));

                $("#TP"+jugador).hide();
                $("#PA"+jugador).hide();
                $("#AS"+jugador).show();
                $("#GO"+jugador).show();
                $("#RF"+jugador).show();
                $("#RD"+jugador).show();
                $("#TA"+jugador).show();
                $("#TR"+jugador).show();
                $("#SP"+jugador).hide();
            }
        }          
    });
    $('.increment-left').click(function() {
        var leftDiv = $(this).closest('.sectionestadistica').find('.numestadisticasleft');
        var tipoestadistica = $(this).closest('.grupdivestadisticas').find('span');
        //console.log("Estadistica "+tipoestadistica.attr("id")+"left");
        var currentValue = parseInt(leftDiv.text());
        leftDiv.text(currentValue + 1);
        localStorage.setItem(tipoestadistica.attr("id")+"left", JSON.stringify(currentValue + 1));
    });
    $('.increment-right').click(function() {
        var rightDiv = $(this).closest('.sectionestadistica').find('.numestadisticasright');
        var tipoestadistica = $(this).closest('.grupdivestadisticas').find('span');
        //console.log("Estadistica "+tipoestadistica.attr("id")+"left");
        var currentValue = parseInt(rightDiv.text());
        rightDiv.text(currentValue + 1);
        localStorage.setItem(tipoestadistica.attr("id")+"right", JSON.stringify(currentValue + 1));
    });
    //-------------------------------------
    $('#add-gol-cto').click(function() {
        $('#goleador-en-juego').empty();
        $('#asistencia-en-juego').empty();  
        for (var i = 0; i < nombresCronometros.length; i++) {
            var jugador = nombresCronometros[i];
            const option = `<option value="${jugador}">${jugador}</option>`;
            if ($("#check" + jugador).is(':checked')) {
                $('#goleador-en-juego').append(option);
                $('#asistencia-en-juego').append(option);
            }
        }
       $('#goleador-modal').show();
    //------------
    //----------    
    });
    //save gol
     $('#save-gol').click(function() {
        // Cambiar el estado de los jugadores seleccionados
        const goleador = $('#goleador-en-juego option:selected').text();
        const asistente = $('#asistencia-en-juego option:selected').text();
        //recoger el minuto
        //capturar el div del marcador 
        var resulCto=parseInt($("#resulCto").text(), 10);
        resulCto++;
        $("#resulCto").text(resulCto);
        //Recoger minuto del partido  
        const minutosTotales = Math.floor(iniTiempo / 60);
         //crear fila en la tabla
         mensajeTablaMarcador('Gol '+goleador+" min "+minutosTotales+" asistencia "+asistente);

        //actualizar en el div el nuevo resultado
        localStorage.setItem('resulCto', JSON.stringify(resulCto));  
        //incrementar el disparo a porteria
        const leftDiv = $('#rematesPorteriaLeft');
        var currentValue = parseInt(leftDiv.text());
        leftDiv.text(currentValue + 1);
        localStorage.setItem("rematesPorterialeft", JSON.stringify(currentValue + 1));

        $('#goleador-modal').hide();    
     });
    //fin de save gol
     //add gol adversario
    $('#add-gol-adv').click(function() {
        //mostrar un campo de numerico y un boton para guardar el numero del goleador
        $('#goleador-adv-modal').show();
    });
    //fin de add gol adversario
    $('#save-gol-adv').click(function() {
        var resulAdv=parseInt($("#resulAdv").text(), 10);
        resulAdv++;
        //recojo el numero del campo de texto
        const minutosTotales = Math.floor(iniTiempo / 60);
        mensajeTablaMarcador(minutosTotales);
        // Añadir la nueva fila a la tabla

        //actualizar en el div el nuevo resultado
        $("#resulAdv").text(resulAdv);
        localStorage.setItem('resulAdv', JSON.stringify(resulAdv));    
        //incrementar remate a porteria del adversario
        const rightDiv = $('#rematesPorteriaRight');
        var currentValue = parseInt(rightDiv.text());
        rightDiv.text(currentValue + 1);
        localStorage.setItem("rematesPorteriaright", JSON.stringify(currentValue + 1));
        $('#goleador-adv-modal').hide(); 
    });
    $('#add-rival').click(function() {
        //mostrar un campo de numerico y un boton para guardar el numero del goleador
        $('#adversario-modal').show();
    });
    $('#saveadversario').click(function() {
        adversario = $('#textadversario').val();
        //console.log(adversario); 
        $('#id2 span').text(adversario);
        $('#textadversario').val("");
        $('#adversario-modal').hide();
        localStorage.setItem('adversario', JSON.stringify(adversario));
    });
    $('#add-new-player').click(function() {
        $('#new-player-modal').show();
    });
    $('#save-new-player').click(function() {
        var new_player=$('#text-player').val();
        //capturar el div cronometros
        var divcrono=$('.cronometros');
        //crear div jugador y añadirlo
        //console.log(new_player);
        nombresCronometros.push(new_player);
        var q_players=nombresCronometros.length;
        //console.log(nombresCronometros+" q_players "+q_players);
        q_players--;
        //console.log(nombresCronometros+" q_players "+q_players);
        add_fila_player(nombresCronometros,q_players);
        $('#'+new_player).on('change', '#check'+new_player, function() {
            //console.log("cambia el checked desde save-new-player ");

            if ($(this).prop('checked')) {
                totaljugadoresencampo++;

            } else { totaljugadoresencampo--;}
            $('#jugjugando').text(totaljugadoresencampo);
        
        });
        $('#new-player-modal').hide();
        //getitem and setittem
        localStorage.setItem('nombresCronometros', JSON.stringify(nombresCronometros));
    });
    $('#close-new-player').click(function() {
        $('#new-player-modal').hide();
    });
    $('#help').click(function() {
        $('#ayuda-modal').show();
    });
    
    $('#tryCapitan').click(function() {
        $('#jugadoresSeleccionados').empty();
        //$('#suplentes').empty();
        for (var i = 0; i < equipotitular.length; i++) {
            var jugador = equipotitular[i];
            var option = `<option value="${jugador}">${jugador}</option>`;
            option = `<option value="${jugador}" selected>${jugador}</option>`;
            $('#jugadoresSeleccionados').append(option);
            
        }
        
        $('#capitan-modal').show();
    });
    $('#cancel-capitan').click(function() {
        $('#capitan-modal').hide();
    });
    $('#save-capitan').click(function() {
        $('#capitan-modal').hide();
        capitan=$('#jugadoresSeleccionados').val();
        localStorage.setItem("capitan", JSON.stringify(capitan));
        
    });


    $('#jugadores-en-juego').val();
    
    
    $( "#equipos" ).on( "change", function() {
        console.log($(this).val());
        equipoElegido=$(this).val();
        //Vaciar el div conometros
        $("#cronometros").empty();
        switch(equipoElegido) {
            //case "BenjaminA":nombresCronometros=benjaminA;break;
            //case "BenjaminB":nombresCronometros=benjaminB;break;
            case "alevinA":nombresCronometros=alevinA;break;
            case "alevinB":nombresCronometros=alevinB;break;
            case "alevinF":nombresCronometros=alevinF;break;
            case "benjaminB":nombresCronometros=benjaminB;break;
            case "benjaminA":nombresCronometros=benjaminA;break;
            case "prebenjaminA":nombresCronometros=prebenjaminA;break;
            case "prebenjaminB":nombresCronometros=prebenjaminB;break;
            case "infantilA":nombresCronometros=infantilA;break;
            case "infantilB":nombresCronometros=infantilB;break;
            case "infantilF":nombresCronometros=infantilF;break;
            case "cadeteA":nombresCronometros=cadeteA;break;
            case "cadeteB":nombresCronometros=cadeteB;break;
            case "cadeteF":nombresCronometros=cadeteF;break;
            case "JuvenilA":nombresCronometros=JuvenilA;break;
            case "JuvenilB":nombresCronometros=JuvenilB;break;
            case "JuvenilF":nombresCronometros=JuvenilB;break;
        }
        //alert('');
        localStorage.setItem('equipoelegido', JSON.stringify(equipoElegido));
        reiniciarIntervalos();
        addeventchange();


        
    });
    addeventchange();
    function addeventchange() {
        $('.checkboxplayers').on('change', function() {
            var idjugador=$(this).attr("id");
            var arraynombre=idjugador.split("check");
            var nombre=arraynombre[1];
            console.log("linea 964 ");

            if ($(this).prop('checked')) {
                console.log('Checkbox marcado');
                equipotitular.push(nombre);
                totaljugadoresencampo++;
                if(totaljugadoresencampo>8){
                    $(this).prop('checked',false)
                        totaljugadoresencampo--;
                }
            } else {
                var playerdesmarcado=equipotitular.indexOf(nombre);
                console.log("A eliminar "+playerdesmarcado)
                if(playerdesmarcado!==-1){
                    equipotitular.splice(playerdesmarcado,1);
                }
                console.log('Checkbox desmarcado');
                    totaljugadoresencampo--;
            }
            console.log(equipotitular);
            $('#jugjugando').text(totaljugadoresencampo);
        
        }
    )
        $('.checkboxportero').on('change', function() {
            for (var jugador in tiempos) {
                //if $("#pcheck"+jugador)is(':checked'))
            }
            }
        );
    };

    $('#showgrafics').click(function() {
        creargrafico();
    });
    function creargrafico() {
        console.log("Show graficos "+tiempos)
        jugadoresgrafico=[];
        tiemposgrafico=[]
        for (var jugador in tiempos) {
            console.log("Show graficos "+jugador+" "+ tiempos[jugador]);
            jugadoresgrafico.push(jugador);
            tiemposgrafico.push(tiempos[jugador]/60);
        }
        if(first){
            //console.log("es la primera volta")
            mostrargrafico(jugadoresgrafico,tiemposgrafico);
            first=false;
        }else{
            myBarChart.destroy();
            //console.log("ya no es la primera volta")
            mostrargrafico(jugadoresgrafico,tiemposgrafico);
        }
    }
    function mostrargrafico(jugadoresgrafico,tiemposgrafico){
    var ctx = document.getElementById('myBarChart').getContext('2d');
    // Datos de ejemplo: 12 datos para el gráfico de barras
    var data = {
        labels: jugadoresgrafico,
        datasets: [{
            label: 'Minutos jugados',
            data:  tiemposgrafico,// Datos de ejemplo para cada mes
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(255, 159, 64, 0.2)',
              'rgba(255, 205, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(201, 203, 207, 0.2)'
            ],
            borderColor: '#C70039', // Color del borde de las barras
            borderWidth: 1
        }]
    };
    // Configuración del gráfico
    var config = {
        type: 'bar', // Tipo de gráfico (en este caso, barras)
        data: data,
        options: {
            responsive: true, // El gráfico se ajustará al tamaño de su contenedor
            scales: {
                y: {
                    beginAtZero: true, // Asegura que el eje Y empiece desde cero
                    max:60,
                }
            },
            plugins: {
                legend: {
                    position: 'top', // Posición de la leyenda
                },
                tooltip: {
                    callbacks: {
                        // Personalización del tooltip
                        label: function(tooltipItem) {
                            return tooltipItem.raw + ' Minutos';
                        }
                    }
                }
            }
        }
    };
    // Crear el gráfico de barras
    myBarChart = new Chart(ctx, config);
    }
    //--------------------------------------------------------------------
      $('#guardar-excel2').click(function() {
        
        
        const Partido="CTO "+adversario;
        const resultadoCto = $("#resulCto").text();
        const resultadoAdv = $("#resulAdv").text();
        console.log(fechacompleta)
        console.log(Partido)
        console.log(equipotitular);
        var nombres=[];
        var tiempos=[];
        var data={};
        var cronometros=$('#cronometros .cronometro')
            for (var i = 0; i < cronometros.length;  i++) {
            var nombre=cronometros.get(i).id;
            var tiempo=$('#time'+cronometros.get(i).id).text();  
            data.push({Nombre: nombre, Tiempo: tiempo});
            data.push({ Nombre: nombre, Tiempo: tiempo })


                
            }    

        const ws= XLSX.utils.json_to_sheet(data);
        const wb= XLSX.utils.book_new();
        // Añadir la hoja de trabajo al libro de trabajo
        XLSX.utils.book_append_sheet(wb, ws, 'Partido '+adversario);
        const fileName = pdfParte+adversario+'.xlsx';
        XLSX.writeFile(wb, fileName);


      });
   $('#guardar-excel').click(function() {

    // 1. Obtener los datos de los cronómetros
    const nombres = [];
    const tiempos = [];
    let cronometros = document.querySelectorAll('#cronometros .cronometro');
    
    cronometros.forEach(function(cronometro) {
        let nombre = cronometro.querySelector('span[id^="name"]').textContent;
        let tiempo = cronometro.querySelector('span[id^="time"]').textContent;
        nombres.push(nombre);
        tiempos.push(tiempo);
    });

    // 2. Obtener los resultados de la tabla
    const resultadoCto = $("#resulCto").text();
    const resultadoAdv = $("#resulAdv").text();

    // 3. Recoger estadísticas
    const estadisticas = [];
    $('.sectionestadistica').each(function() {
        const leftValue = $(this).find('.numestadisticasleft').text();
        const rightValue = $(this).find('.numestadisticasright').text();
        const estadisticaLabel = $(this).find('span').text();
        estadisticas.push([estadisticaLabel, leftValue, rightValue]);
    });

    // 4. Crear la hoja de trabajo con los cronómetros
    //XLSX.utils.sheet_add_aoa(ws, [['Fecha',fechacompleta]], { origin: -1 });
        var Fecha=new Date();
        var dia=Fecha.getDate();
        var mes=Fecha.getMonth()+1;
        var year=Fecha.getFullYear();
        var fechacompleta=dia+"/"+mes+"/"+year;
     const ws =   XLSX.utils.aoa_to_sheet([['Fecha', fechacompleta]], { origin: 'A1' });
     XLSX.utils.sheet_add_aoa(ws,[['Nombre', 'Tiempo'], ...nombres.map((n, i) => [n, tiempos[i]])],{origin:'A2'});
     XLSX.utils.sheet_add_aoa(ws,[['Capitan', capitan]], { origin: -1 });
  


    // 5. Agregar resultados de la tabla de marcador
    const adversario = $('#id2 span').text();
    XLSX.utils.sheet_add_aoa(ws, [['Resultados'], ['CTO', adversario], [resultadoCto, resultadoAdv]], { origin: -1 });

    // 6. Agregar estadísticas
    XLSX.utils.sheet_add_aoa(ws, [['Estadísticas'], ['Descripción', 'Cto', adversario]], { origin: -1 });
    estadisticas.forEach(stat => {
        XLSX.utils.sheet_add_aoa(ws, [stat], { origin: -1 });
    });

    // 7. Agregar la tabla de marcador
    const tablaMarcador = [];
    $('#tablaMarcador tbody tr').each(function() {
        const row = [];
        $(this).find('td, th').each(function() {
            row.push($(this).text().trim());
        });
        if (row.length > 0) {
            tablaMarcador.push(row);
        }
    });

    // 8. Agregar la tabla al Excel
    XLSX.utils.sheet_add_aoa(ws, [['Tabla Marcador'], ...tablaMarcador], { origin: -1 });

    // 9. Ajustar las columnas
    const colWidths = [
        { wch: 20 }, // Nombre
        { wch: 10 }, // Tiempo
        { wch: 30 }, // Estadísticas
        { wch: 10 }, // Equipo 1
        { wch: 10 }  // Equipo 2
    ];
    ws['!cols'] = colWidths;

    // 10. Crear el libro de trabajo y exportar a Excel
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Cronómetros y Marcador');
    XLSX.writeFile(wb, pdfParte + adversario + ' .xlsx');

    // 11. Resetear variable
    pdfParte = "Total Partido ";
});

});       
     //-------------------------------------------------------------------------------------

