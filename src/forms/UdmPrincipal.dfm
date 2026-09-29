object dmPrincipal: TdmPrincipal
  Height = 342
  Width = 502
  PixelsPerInch = 96
  object ConexaoPrincipal: TFDConnection
    Params.Strings = (
      
        'Database=C:\Users\USUARIO\Documents\Projetos\world_cup\database\' +
        'BASE.FDB'
      'User_Name=SYSDBA'
      'Password=masterkey'
      'DriverID=FB')
    Connected = True
    LoginPrompt = False
    Left = 48
    Top = 16
  end
  object qry_Times: TFDQuery
    Connection = ConexaoPrincipal
    SQL.Strings = (
      'Select * from TTIMES')
    Left = 48
    Top = 80
    object qry_TimesCODIGO: TIntegerField
      FieldName = 'CODIGO'
      Origin = 'CODIGO'
      ProviderFlags = [pfInUpdate, pfInWhere, pfInKey]
      Required = True
      DisplayFormat = '0000'
    end
    object qry_TimesSELECAO: TStringField
      FieldName = 'SELECAO'
      Origin = 'SELECAO'
      Size = 50
    end
    object qry_TimesSIGLA: TStringField
      FieldName = 'SIGLA'
      Origin = 'SIGLA'
      Size = 3
    end
    object qry_TimesBANDEIRA: TStringField
      FieldName = 'BANDEIRA'
      Origin = 'BANDEIRA'
      Size = 100
    end
    object qry_TimesCONTINENTE: TStringField
      FieldName = 'CONTINENTE'
      Origin = 'CONTINENTE'
      Size = 40
    end
    object qry_TimesPONTUACAO: TIntegerField
      FieldName = 'PONTUACAO'
      Origin = 'PONTUACAO'
    end
    object qry_TimesSALDO: TIntegerField
      FieldName = 'SALDO'
      Origin = 'SALDO'
    end
  end
  object dsTimes: TDataSource
    DataSet = qry_Times
    Left = 128
    Top = 80
  end
  object qry_Competicao: TFDQuery
    AfterInsert = qry_CompeticaoAfterInsert
    Connection = ConexaoPrincipal
    SQL.Strings = (
      'Select * from TCOMPETICAO')
    Left = 48
    Top = 144
    object qry_CompeticaoCODIGO: TIntegerField
      FieldName = 'CODIGO'
      Origin = 'CODIGO'
      ProviderFlags = [pfInUpdate, pfInWhere, pfInKey]
      Required = True
    end
    object qry_CompeticaoEDICAO: TStringField
      FieldName = 'EDICAO'
      Origin = 'EDICAO'
    end
    object qry_CompeticaoMODELO: TIntegerField
      FieldName = 'MODELO'
      Origin = 'MODELO'
    end
    object qry_CompeticaoINICIO: TSQLTimeStampField
      FieldName = 'INICIO'
      Origin = 'INICIO'
    end
    object qry_CompeticaoFIM: TSQLTimeStampField
      FieldName = 'FIM'
      Origin = 'FIM'
    end
    object qry_CompeticaoSTATUS: TStringField
      FieldName = 'STATUS'
      Origin = 'STATUS'
    end
    object qry_CompeticaoANFITRIAO: TIntegerField
      FieldName = 'ANFITRIAO'
      Origin = 'ANFITRIAO'
    end
    object qry_CompeticaoRODADA: TIntegerField
      FieldName = 'RODADA'
      Origin = 'RODADA'
    end
  end
  object dsCompeticao: TDataSource
    DataSet = qry_Competicao
    Left = 128
    Top = 144
  end
  object qry_Modelo: TFDQuery
    Connection = ConexaoPrincipal
    SQL.Strings = (
      'Select * from TMODELO')
    Left = 48
    Top = 208
    object qry_ModeloCODIGO: TIntegerField
      FieldName = 'CODIGO'
      Origin = 'CODIGO'
      ProviderFlags = [pfInUpdate, pfInWhere, pfInKey]
      Required = True
    end
    object qry_ModeloMODELO: TStringField
      FieldName = 'MODELO'
      Origin = 'MODELO'
    end
    object qry_ModeloQUANTTIMES: TIntegerField
      FieldName = 'QUANTTIMES'
      Origin = 'QUANTTIMES'
    end
  end
  object dsModelo: TDataSource
    DataSet = qry_Modelo
    Left = 128
    Top = 208
  end
  object qry_Participante: TFDQuery
    Connection = ConexaoPrincipal
    SQL.Strings = (
      'Select * from TPARTICIPANTE where COMPETICAO = :pId')
    Left = 48
    Top = 272
    ParamData = <
      item
        Name = 'PID'
        DataType = ftInteger
        ParamType = ptInput
        Value = Null
      end>
    object qry_ParticipanteCODIGO: TIntegerField
      FieldName = 'CODIGO'
      Origin = 'CODIGO'
      ProviderFlags = [pfInUpdate, pfInWhere, pfInKey]
      Required = True
    end
    object qry_ParticipanteCOMPETICAO: TIntegerField
      FieldName = 'COMPETICAO'
      Origin = 'COMPETICAO'
    end
    object qry_ParticipanteSELECAO: TIntegerField
      FieldName = 'SELECAO'
      Origin = 'SELECAO'
    end
    object qry_ParticipanteCOLOCACAO: TIntegerField
      FieldName = 'COLOCACAO'
      Origin = 'COLOCACAO'
    end
    object qry_ParticipanteANFITRIAO: TStringField
      FieldName = 'ANFITRIAO'
      Origin = 'ANFITRIAO'
      Size = 3
    end
  end
  object dsParticipante: TDataSource
    DataSet = qry_Participante
    Left = 128
    Top = 272
  end
end
