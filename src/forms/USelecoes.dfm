object FrmListagemSelecoes: TFrmListagemSelecoes
  Left = 0
  Top = 0
  BorderIcons = [biSystemMenu]
  BorderStyle = bsSingle
  Caption = 'Listagem de sele'#231#245'es'
  ClientHeight = 400
  ClientWidth = 600
  Color = 16381942
  Font.Charset = DEFAULT_CHARSET
  Font.Color = clWindowText
  Font.Height = -12
  Font.Name = 'Segoe UI'
  Font.Style = []
  Position = poScreenCenter
  OnShow = FormShow
  PixelsPerInch = 96
  TextHeight = 15
  object Panel1: TPanel
    Left = 0
    Top = 0
    Width = 600
    Height = 60
    Align = alTop
    BevelOuter = bvNone
    Caption = 'Panel1'
    Color = 16381942
    ParentBackground = False
    ShowCaption = False
    TabOrder = 0
    object Label1: TLabel
      Left = 5
      Top = 5
      Width = 153
      Height = 15
      Caption = 'Pesquise pelo nome do time:'
    end
    object Edit1: TEdit
      Left = 5
      Top = 23
      Width = 590
      Height = 27
      CharCase = ecUpperCase
      Font.Charset = DEFAULT_CHARSET
      Font.Color = clWindowText
      Font.Height = -14
      Font.Name = 'Segoe UI'
      Font.Style = []
      ParentFont = False
      TabOrder = 0
      TextHint = 'INFORME O NOME DO TIME'
      OnChange = Edit1Change
    end
  end
  object Panel2: TPanel
    Left = 0
    Top = 60
    Width = 600
    Height = 340
    Align = alClient
    BevelOuter = bvNone
    Caption = 'Panel1'
    Color = 16381942
    ParentBackground = False
    ShowCaption = False
    TabOrder = 1
    ExplicitTop = 49
    ExplicitHeight = 351
    object DBGrid1: TDBGrid
      Left = 0
      Top = 0
      Width = 600
      Height = 340
      Align = alClient
      DataSource = dmPrincipal.dsTimes
      TabOrder = 0
      TitleFont.Charset = DEFAULT_CHARSET
      TitleFont.Color = clWindowText
      TitleFont.Height = -12
      TitleFont.Name = 'Segoe UI'
      TitleFont.Style = []
      Columns = <
        item
          Alignment = taLeftJustify
          Expanded = False
          FieldName = 'CODIGO'
          Title.Caption = 'C'#211'DIGO'
          Width = 100
          Visible = True
        end
        item
          Expanded = False
          FieldName = 'SELECAO'
          Title.Caption = 'SELE'#199#195'O'
          Width = 360
          Visible = True
        end
        item
          Expanded = False
          FieldName = 'SIGLA'
          Width = 100
          Visible = True
        end>
    end
  end
end
