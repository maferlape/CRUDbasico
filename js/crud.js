//crea a base de dados
var db=openDatabase("CRUDbasico", "1.0", "CRUDbasico", 65535)

var nuevoId;

//Crea a tabela
$("#create").click(function(){
    db.transaction(function(transaction){
        var sql="CREATE TABLE pessoas "+
        "(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,"+
        "name VARCHAR(100) NOT NULL, "+
        "birth DATE NOT NULL, "+
        "cpf VARCHAR(30) NOT NULL)";
        transaction.executeSql(sql, undefined, function(){
            alert("Tabela creada satisfactoriamente")
        }, function(transaction, err){
            alert(err.message)
        })
    });
});

//Registra os datos 
$("#enter").click(function(){
    var name=$("#name").val();
    var birth=$("#birth").val();
    var cpf=$("#cpf").val();

    if(name=="" || birth=="" || cpf==""){
        alert("Preencha todos os campos")
    } else if(name.length>60){
        alert("Não permite nomes com mais de 60 caracteres")
    }else if(!ValidationCPF(cpf)){
        alert("Digite seu CPF correctamente")
    }else if(!validaData(birth)){
        alert("Digite sua data de aniversário correctamente")
    }else{
        db.transaction(function(transaction){
            var sql="INSERT INTO pessoas(name,birth,cpf) VALUES(?,?,?)";
            transaction.executeSql(sql,[name,birth,cpf], function(){
            },function(transaction,err){
                alert(err.message);
            })
        })
    
        limpiar();
        cargarDatos();
    }
})

//Actualiza e mostra os registros 
$("#list").click(function(){
    cargarDatos()
})

//Modifica os dados 
$("#edit").click(function(){
    var nName=$("#name").val();
    var nbirth=$("#birth").val();
    var ncpf=$("#cpf").val();

    db.transaction(function(transaction){
        var sql="UPDATE pessoas SET name='"+nName+"', birth='"+nbirth+"', cpf='"+ncpf+"' WHERE id="+nuevoId+""
        transaction.executeSql(sql,undefined, function(){
            cargarDatos();
            limpiar()
        }, function(transaction, err){
                alert(err.message)
        })
    
    })
})

//Exclue registros
$("#deletar").click(function(){
    if(!confirm("Tem certeza de que deseja excluir a tabela?, os dados serão perdidos permanentemente",""))
    return;
    db.transaction(function(transaction){
        var sql="DROP TABLE pessoas";
        transaction.executeSql(sql,undefined,function(){
            alert("Tabela excluída com sucesso, atualize a página")
        }, function(transaction, err){
            alert(err,message)
        })
    })
})


function limpiar(){
    document.getElementById("name").value="";
    document.getElementById("birth").value="";
    document.getElementById("cpf").value="";
}

function cargarDatos(){
    $("#listaPessoas").children().remove();
        db.transaction(function(transaction){
            var sql ="SELECT * FROM pessoas ORDER BY id DESC";
            transaction.executeSql(sql, undefined, function(transaction, result){
                if(result.rows.length){
                    $("#listaPessoas").append('<thead><tr><th>ID</th><th>NOME</th><th>BIRTH</th><th>CPF</th><th></th><th></th></tr></thead>');
                
                    for(var i=0; i<result.rows.length;i++){
                        var row = result.rows.item(i);
                        var id = row.id;
                        var name = row.name;
                        var birth = row.birth
                        var cpf = row.cpf;
                        $("#listaPessoas").append('<tbody><tr id="fila'+id+'" class="reg_p'+id+'"><td><span class="mid">'+id+'</span></td><td><span>'+name+'</span></td><td><span>'+birth+'</span></td><td><span>'+cpf+'</span></td><td><button class="edit-button" onclick="editarRegistro()" type="button" id='+id+'><img src="/img/edit.png" alt=""></button></td><td><button type="button" class="delete-button" id='+id+' onclick="eliminarRegistro()"><img src="/img/delete.png" alt=""></button></td></tr><tbody>');
                    }
                }else{
                    $("#listaPessoas").append('<tr><td colspan="5" align="center"> No existen registros</td></tr>');
                }
            }, function(transaction, err){
                alert(err.message);
            })
                
        })
}

function eliminarRegistro(){

    if(!confirm("Tem certeza de que deseja excluir o registo?, os dados serão perdidos permanentemente",""))
    return;

    $(document).one('click','button[type="button"]', function(event){
        let id=this.id;
        var lista = [];
        $("#listaPessoas").each(function(){
            var celdas = $(this).find('tr.reg_p'+id);
            celdas.each(function(){
                var registro=$(this).find('span.mid');
                registro.each(function(){
                    lista.push($(this).html())
                });
            });
        });

        nuevoId = lista[0];
        db.transaction(function(transaction){
            var sql = "DELETE FROM pessoas WHERE id="+nuevoId+";"
            transaction.executeSql(sql,undefined,function(){
                alert("Registro excluido com sucesso, por favor atualize a tabela")
            }, function(transaction, err){
                alert(err.message);
            })
        })

    });
}

function editarRegistro(){
    $(document).one('click','button[type="button"]', function(event){
        
        let id=this.id;
        var lista = [];
        $("#listaPessoas").each(function(){
            var celdas = $(this).find('tr.reg_p'+id);
            celdas.each(function(){
                var registro=$(this).find('span');
                registro.each(function(){
                    lista.push($(this).html())
                });
            });
        });

        document.getElementById("name").value=lista[1];
        document.getElementById("birth").value=lista[2];
        document.getElementById("cpf").value=lista[3];
        nuevoId=lista[0];
    })   
}

function validaData(birth){
    var toDate = new Date(birth)
    var dateTime = toDate.getTime()
    var dateNow = Date.now()
    
    if(dateTime<dateNow)
        return true
}

function ValidationCPF(cpf) {
    var Soma;
    var Resto;
    Soma = 0;
    if (cpf == "00000000000") return false;

    for (i=1; i<=9; i++){
        Soma = Soma + parseInt(cpf.substring(i-1, i)) * (11 - i);
    } 

    Resto = (Soma * 10) % 11;
    
    if ((Resto == 10) || (Resto == 11)){
        Resto = 0;
    }
      
    if (Resto != parseInt(cpf.substring(9, 10))) {
        return false;
    }
        
    Soma = 0;
    for (i = 1; i <= 10; i++) {
        Soma = Soma + parseInt(cpf.substring(i-1, i)) * (12 - i);
    }

    Resto = (Soma * 10) % 11;

    if ((Resto == 10) || (Resto == 11)){
        Resto = 0;
    }

    if (Resto != parseInt(cpf.substring(10, 11))){
        return false;
    }
    
    return true;
}




