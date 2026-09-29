unit UnitChaveamento;

interface

uses
  Winapi.Windows, Winapi.Messages, System.SysUtils, System.Variants, System.Classes, Vcl.Graphics,
  Vcl.Controls, Vcl.Forms, Vcl.Dialogs, Vcl.ExtCtrls, Vcl.WinXPanels,
  Vcl.ComCtrls, Data.DB, FireDAC.Stan.Intf, FireDAC.Stan.Option,
  FireDAC.Stan.Param, FireDAC.Stan.Error, FireDAC.DatS, FireDAC.Phys.Intf,
  FireDAC.DApt.Intf, FireDAC.Stan.Async, FireDAC.DApt, FireDAC.Comp.DataSet,
  FireDAC.Comp.Client, Vcl.Grids, Vcl.DBGrids, Vcl.Imaging.pngimage,
  uniGUIBaseClasses, uniGUIClasses, uniImage, Vcl.Imaging.jpeg, Vcl.StdCtrls,
  Vcl.Buttons;

type
  TFrmChaveamento = class(TForm)
    PageControl1: TPageControl;
    tabGrupos: TTabSheet;
    Panel1: TPanel;
    Panel3: TPanel;
    Panel4: TPanel;
    Panel2: TPanel;
    Panel5: TPanel;
    Panel6: TPanel;
    Panel7: TPanel;
    Panel8: TPanel;
    Panel9: TPanel;
    DBGrid4: TDBGrid;
    GrupoA: TFDQuery;
    DataSource1: TDataSource;
    GrupoACODIGO: TIntegerField;
    GrupoACOMPETICAO: TIntegerField;
    GrupoAGRUPO: TStringField;
    GrupoASELECAO: TIntegerField;
    GrupoAPONTUACAO: TIntegerField;
    GrupoASALDO: TIntegerField;
    GrupoAVITORIAS: TIntegerField;
    GrupoAEMPATES: TIntegerField;
    GrupoADERROTAS: TIntegerField;
    GrupoAGOLSFEITOS: TIntegerField;
    GrupoAGOLSLEVADOS: TIntegerField;
    GrupoAPOTEORIGEM: TIntegerField;
    GrupoATIME: TStringField;
    GrupoARANKING: TIntegerField;
    DBGrid1: TDBGrid;
    DBGrid2: TDBGrid;
    DBGrid3: TDBGrid;
    DataSource2: TDataSource;
    GrupoB: TFDQuery;
    IntegerField1: TIntegerField;
    IntegerField2: TIntegerField;
    IntegerField3: TIntegerField;
    StringField1: TStringField;
    IntegerField4: TIntegerField;
    IntegerField5: TIntegerField;
    IntegerField6: TIntegerField;
    IntegerField7: TIntegerField;
    IntegerField8: TIntegerField;
    IntegerField9: TIntegerField;
    IntegerField10: TIntegerField;
    IntegerField11: TIntegerField;
    IntegerField12: TIntegerField;
    StringField2: TStringField;
    DataSource3: TDataSource;
    GrupoC: TFDQuery;
    IntegerField13: TIntegerField;
    IntegerField14: TIntegerField;
    IntegerField15: TIntegerField;
    StringField3: TStringField;
    IntegerField16: TIntegerField;
    IntegerField17: TIntegerField;
    IntegerField18: TIntegerField;
    IntegerField19: TIntegerField;
    IntegerField20: TIntegerField;
    IntegerField21: TIntegerField;
    IntegerField22: TIntegerField;
    IntegerField23: TIntegerField;
    IntegerField24: TIntegerField;
    StringField4: TStringField;
    DataSource4: TDataSource;
    GrupoD: TFDQuery;
    IntegerField25: TIntegerField;
    IntegerField26: TIntegerField;
    IntegerField27: TIntegerField;
    StringField5: TStringField;
    IntegerField28: TIntegerField;
    IntegerField29: TIntegerField;
    IntegerField30: TIntegerField;
    IntegerField31: TIntegerField;
    IntegerField32: TIntegerField;
    IntegerField33: TIntegerField;
    IntegerField34: TIntegerField;
    IntegerField35: TIntegerField;
    IntegerField36: TIntegerField;
    StringField6: TStringField;
    Panel10: TPanel;
    Panel11: TPanel;
    Panel12: TPanel;
    DBGrid5: TDBGrid;
    Panel13: TPanel;
    Panel14: TPanel;
    DBGrid6: TDBGrid;
    Panel15: TPanel;
    Panel16: TPanel;
    DBGrid7: TDBGrid;
    Panel17: TPanel;
    Panel18: TPanel;
    DBGrid8: TDBGrid;
    Panel19: TPanel;
    Panel20: TPanel;
    Panel21: TPanel;
    DBGrid9: TDBGrid;
    Panel22: TPanel;
    Panel23: TPanel;
    DBGrid10: TDBGrid;
    Panel24: TPanel;
    Panel25: TPanel;
    DBGrid11: TDBGrid;
    Panel26: TPanel;
    Panel27: TPanel;
    DBGrid12: TDBGrid;
    DataSource5: TDataSource;
    GrupoEIntegerField37: TIntegerField;
    GrupoEIntegerField38: TIntegerField;
    GrupoEIntegerField39: TIntegerField;
    GrupoEStringField7: TStringField;
    GrupoEIntegerField40: TIntegerField;
    GrupoEIntegerField41: TIntegerField;
    GrupoEIntegerField42: TIntegerField;
    GrupoEIntegerField43: TIntegerField;
    GrupoEIntegerField44: TIntegerField;
    GrupoEIntegerField45: TIntegerField;
    GrupoEIntegerField46: TIntegerField;
    GrupoEIntegerField47: TIntegerField;
    GrupoEIntegerField48: TIntegerField;
    GrupoEStringField8: TStringField;
    DataSource6: TDataSource;
    GrupoF: TFDQuery;
    IntegerField49: TIntegerField;
    IntegerField50: TIntegerField;
    IntegerField51: TIntegerField;
    StringField9: TStringField;
    IntegerField52: TIntegerField;
    IntegerField53: TIntegerField;
    IntegerField54: TIntegerField;
    IntegerField55: TIntegerField;
    IntegerField56: TIntegerField;
    IntegerField57: TIntegerField;
    IntegerField58: TIntegerField;
    IntegerField59: TIntegerField;
    IntegerField60: TIntegerField;
    StringField10: TStringField;
    DataSource7: TDataSource;
    GrupoG: TFDQuery;
    IntegerField61: TIntegerField;
    IntegerField62: TIntegerField;
    IntegerField63: TIntegerField;
    StringField11: TStringField;
    IntegerField64: TIntegerField;
    IntegerField65: TIntegerField;
    IntegerField66: TIntegerField;
    IntegerField67: TIntegerField;
    IntegerField68: TIntegerField;
    IntegerField69: TIntegerField;
    IntegerField70: TIntegerField;
    IntegerField71: TIntegerField;
    IntegerField72: TIntegerField;
    StringField12: TStringField;
    DataSource8: TDataSource;
    GrupoH: TFDQuery;
    IntegerField73: TIntegerField;
    IntegerField74: TIntegerField;
    IntegerField75: TIntegerField;
    StringField13: TStringField;
    IntegerField76: TIntegerField;
    IntegerField77: TIntegerField;
    IntegerField78: TIntegerField;
    IntegerField79: TIntegerField;
    IntegerField80: TIntegerField;
    IntegerField81: TIntegerField;
    IntegerField82: TIntegerField;
    IntegerField83: TIntegerField;
    IntegerField84: TIntegerField;
    StringField14: TStringField;
    DataSource9: TDataSource;
    GrupoI: TFDQuery;
    IntegerField85: TIntegerField;
    IntegerField86: TIntegerField;
    IntegerField87: TIntegerField;
    StringField15: TStringField;
    IntegerField88: TIntegerField;
    IntegerField89: TIntegerField;
    IntegerField90: TIntegerField;
    IntegerField91: TIntegerField;
    IntegerField92: TIntegerField;
    IntegerField93: TIntegerField;
    IntegerField94: TIntegerField;
    IntegerField95: TIntegerField;
    IntegerField96: TIntegerField;
    StringField16: TStringField;
    DataSource10: TDataSource;
    GrupoJ: TFDQuery;
    IntegerField97: TIntegerField;
    IntegerField98: TIntegerField;
    IntegerField99: TIntegerField;
    StringField17: TStringField;
    IntegerField100: TIntegerField;
    IntegerField101: TIntegerField;
    IntegerField102: TIntegerField;
    IntegerField103: TIntegerField;
    IntegerField104: TIntegerField;
    IntegerField105: TIntegerField;
    IntegerField106: TIntegerField;
    IntegerField107: TIntegerField;
    IntegerField108: TIntegerField;
    StringField18: TStringField;
    DataSource11: TDataSource;
    GrupoK: TFDQuery;
    IntegerField109: TIntegerField;
    IntegerField110: TIntegerField;
    IntegerField111: TIntegerField;
    StringField19: TStringField;
    IntegerField112: TIntegerField;
    IntegerField113: TIntegerField;
    IntegerField114: TIntegerField;
    IntegerField115: TIntegerField;
    IntegerField116: TIntegerField;
    IntegerField117: TIntegerField;
    IntegerField118: TIntegerField;
    IntegerField119: TIntegerField;
    IntegerField120: TIntegerField;
    StringField20: TStringField;
    DataSource12: TDataSource;
    GrupoL: TFDQuery;
    IntegerField121: TIntegerField;
    IntegerField122: TIntegerField;
    IntegerField123: TIntegerField;
    StringField21: TStringField;
    IntegerField124: TIntegerField;
    IntegerField125: TIntegerField;
    IntegerField126: TIntegerField;
    IntegerField127: TIntegerField;
    IntegerField128: TIntegerField;
    IntegerField129: TIntegerField;
    IntegerField130: TIntegerField;
    IntegerField131: TIntegerField;
    IntegerField132: TIntegerField;
    StringField22: TStringField;
    GrupoE: TFDQuery;
    tbsEliminatorias: TTabSheet;
    p73_1: TPanel;
    Image1: TImage;
    p73_2: TPanel;
    Image2: TImage;
    p81_1: TPanel;
    Image3: TImage;
    p81_2: TPanel;
    Image4: TImage;
    p74_1: TPanel;
    Image5: TImage;
    p74_2: TPanel;
    Image6: TImage;
    p82_1: TPanel;
    Image7: TImage;
    p82_2: TPanel;
    Image8: TImage;
    p89_1: TPanel;
    Image9: TImage;
    Panel38: TPanel;
    Shape3: TShape;
    Shape4: TShape;
    p89_2: TPanel;
    Image10: TImage;
    Panel40: TPanel;
    Shape5: TShape;
    Shape6: TShape;
    p93_1: TPanel;
    Image11: TImage;
    Panel42: TPanel;
    Shape7: TShape;
    Shape8: TShape;
    p93_2: TPanel;
    Image12: TImage;
    Panel36: TPanel;
    Shape1: TShape;
    Shape2: TShape;
    Panel44: TPanel;
    Shape9: TShape;
    Shape10: TShape;
    Panel45: TPanel;
    Shape11: TShape;
    Shape12: TShape;
    p97_1: TPanel;
    Image13: TImage;
    p97_2: TPanel;
    Image14: TImage;
    Panel48: TPanel;
    Shape13: TShape;
    p101_1: TPanel;
    Image15: TImage;
    Panel50: TPanel;
    Panel51: TPanel;
    Panel52: TPanel;
    Panel53: TPanel;
    Panel54: TPanel;
    Panel55: TPanel;
    Shape15: TShape;
    Panel56: TPanel;
    p75_1: TPanel;
    Image31: TImage;
    p75_2: TPanel;
    Image32: TImage;
    p83_1: TPanel;
    Image33: TImage;
    p83_2: TPanel;
    Image34: TImage;
    p76_1: TPanel;
    Image35: TImage;
    p76_2: TPanel;
    Image36: TImage;
    p84_1: TPanel;
    Image37: TImage;
    p84_2: TPanel;
    Image38: TImage;
    p90_1: TPanel;
    Image39: TImage;
    Panel95: TPanel;
    Shape29: TShape;
    Shape30: TShape;
    Panel96: TPanel;
    p90_2: TPanel;
    Image40: TImage;
    Panel98: TPanel;
    Shape31: TShape;
    Shape32: TShape;
    Panel99: TPanel;
    p94_1: TPanel;
    Image41: TImage;
    Panel101: TPanel;
    Shape33: TShape;
    Shape34: TShape;
    Panel102: TPanel;
    p94_2: TPanel;
    Image42: TImage;
    Panel104: TPanel;
    Shape35: TShape;
    Shape36: TShape;
    Panel105: TPanel;
    Panel106: TPanel;
    Shape37: TShape;
    Shape38: TShape;
    Panel107: TPanel;
    Panel108: TPanel;
    Shape39: TShape;
    Shape40: TShape;
    Panel109: TPanel;
    p98_1: TPanel;
    Image43: TImage;
    p98_2: TPanel;
    Image44: TImage;
    Panel112: TPanel;
    Shape41: TShape;
    Shape42: TShape;
    Panel113: TPanel;
    p102_1: TPanel;
    Image45: TImage;
    p79_1: TPanel;
    Image16: TImage;
    p79_2: TPanel;
    Image17: TImage;
    p87_1: TPanel;
    Image18: TImage;
    p87_2: TPanel;
    Image19: TImage;
    p80_1: TPanel;
    Image20: TImage;
    p80_2: TPanel;
    Image21: TImage;
    p88_1: TPanel;
    Image22: TImage;
    p88_2: TPanel;
    Image23: TImage;
    p92_1: TPanel;
    Image24: TImage;
    Panel66: TPanel;
    Shape14: TShape;
    Shape16: TShape;
    Panel67: TPanel;
    p92_2: TPanel;
    Image25: TImage;
    Panel69: TPanel;
    Shape17: TShape;
    Shape18: TShape;
    Panel70: TPanel;
    p96_1: TPanel;
    Image26: TImage;
    Panel72: TPanel;
    Shape19: TShape;
    Shape20: TShape;
    Panel73: TPanel;
    p96_2: TPanel;
    Image27: TImage;
    Panel75: TPanel;
    Shape21: TShape;
    Shape22: TShape;
    Panel76: TPanel;
    Panel77: TPanel;
    Shape23: TShape;
    Shape24: TShape;
    Panel78: TPanel;
    Panel79: TPanel;
    Shape25: TShape;
    Shape26: TShape;
    Panel80: TPanel;
    p100_1: TPanel;
    Image28: TImage;
    p100_2: TPanel;
    Image29: TImage;
    Panel83: TPanel;
    Shape27: TShape;
    Shape28: TShape;
    Panel84: TPanel;
    p102_2: TPanel;
    Image30: TImage;
    p77_1: TPanel;
    Image46: TImage;
    p77_2: TPanel;
    Image47: TImage;
    p85_1: TPanel;
    Image48: TImage;
    p85_2: TPanel;
    Image49: TImage;
    p78_1: TPanel;
    Image50: TImage;
    p78_2: TPanel;
    Image51: TImage;
    p86_1: TPanel;
    Image52: TImage;
    p86_2: TPanel;
    Image53: TImage;
    p91_1: TPanel;
    Image54: TImage;
    Panel124: TPanel;
    Shape43: TShape;
    Shape44: TShape;
    Panel125: TPanel;
    p91_2: TPanel;
    Image55: TImage;
    Panel127: TPanel;
    Shape45: TShape;
    Shape46: TShape;
    Panel128: TPanel;
    p95_1: TPanel;
    Image56: TImage;
    Panel130: TPanel;
    Shape47: TShape;
    Shape48: TShape;
    Panel131: TPanel;
    p95_2: TPanel;
    Image57: TImage;
    Panel133: TPanel;
    Shape49: TShape;
    Shape50: TShape;
    Panel134: TPanel;
    Panel135: TPanel;
    Shape51: TShape;
    Shape52: TShape;
    Panel136: TPanel;
    Panel137: TPanel;
    Shape53: TShape;
    Shape54: TShape;
    Panel138: TPanel;
    p99_1: TPanel;
    Image58: TImage;
    p99_2: TPanel;
    Image59: TImage;
    Panel141: TPanel;
    Shape55: TShape;
    Shape56: TShape;
    Panel142: TPanel;
    p101_2: TPanel;
    Image60: TImage;
    Panel144: TPanel;
    Shape57: TShape;
    Shape58: TShape;
    Panel145: TPanel;
    p104_1: TPanel;
    Image61: TImage;
    Panel147: TPanel;
    Shape59: TShape;
    Shape60: TShape;
    Panel148: TPanel;
    p104_2: TPanel;
    Image62: TImage;
    Label1: TLabel;
    tbsRodada: TTabSheet;
    lblRodadaAtual: TLabel;
    Panel150: TPanel;
    dbgConfrontos: TDBGrid;
    qry_Confrontos: TFDQuery;
    dsConfrontos: TDataSource;
    qry_ConfrontosCODIGO: TIntegerField;
    qry_ConfrontosCOMPETICAO: TIntegerField;
    qry_ConfrontosRODADA: TIntegerField;
    qry_ConfrontosCODSELECAO1: TIntegerField;
    qry_ConfrontosSELECAO1: TStringField;
    qry_ConfrontosCODSELECAO2: TIntegerField;
    qry_ConfrontosSELECAO2: TStringField;
    qry_ConfrontosGOLSELECAO1: TIntegerField;
    qry_ConfrontosGOLSELECAO2: TIntegerField;
    qry_ConfrontosVENCEDOR: TIntegerField;
    qry_ConfrontosENCERRADO: TStringField;
    qry_ConfrontosFLAGSELECAO1: TStringField;
    qry_ConfrontosNUMEROPARTIDA: TIntegerField;
    qry_ConfrontosFLAGSELECAO2: TStringField;
    qry_ConfrontosVERSUS: TStringField;
    Panel151: TPanel;
    Panel152: TPanel;
    pnlProximoConfronto: TPanel;
    Image63: TImage;
    Label2: TLabel;
    Label3: TLabel;
    Label4: TLabel;
    Image64: TImage;
    pnljogar: TPanel;
    SpeedButton1: TSpeedButton;
    Panel153: TPanel;
    SpeedButton3: TSpeedButton;
    qry_ProximoConfronto: TFDQuery;
    qry_ProximoConfrontoCODIGO: TIntegerField;
    qry_ProximoConfrontoCOMPETICAO: TIntegerField;
    qry_ProximoConfrontoRODADA: TIntegerField;
    qry_ProximoConfrontoNUMEROPARTIDA: TIntegerField;
    qry_ProximoConfrontoCODSELECAO1: TIntegerField;
    qry_ProximoConfrontoSELECAO1: TStringField;
    qry_ProximoConfrontoCODSELECAO2: TIntegerField;
    qry_ProximoConfrontoSELECAO2: TStringField;
    qry_ProximoConfrontoGOLSELECAO1: TIntegerField;
    qry_ProximoConfrontoGOLSELECAO2: TIntegerField;
    qry_ProximoConfrontoVENCEDOR: TIntegerField;
    qry_ProximoConfrontoENCERRADO: TStringField;
    qry_ProximoConfrontoFLAGSELECAO1: TStringField;
    qry_ProximoConfrontoFLAGSELECAO2: TStringField;
    qry_Bracket: TFDQuery;
    qry_BracketCODIGO: TIntegerField;
    qry_BracketCOMPETICAO: TIntegerField;
    qry_BracketRODADA: TIntegerField;
    qry_BracketNUMEROPARTIDA: TIntegerField;
    qry_BracketCODSELECAO1: TIntegerField;
    qry_BracketSELECAO1: TStringField;
    qry_BracketCODSELECAO2: TIntegerField;
    qry_BracketSELECAO2: TStringField;
    qry_BracketGOLSELECAO1: TIntegerField;
    qry_BracketGOLSELECAO2: TIntegerField;
    qry_BracketVENCEDOR: TIntegerField;
    qry_BracketENCERRADO: TStringField;
    qry_BracketFLAGSELECAO1: TStringField;
    qry_BracketFLAGSELECAO2: TStringField;
    pnlPartida: TPanel;
    Label5: TLabel;
    Panel28: TPanel;
    SpeedButton2: TSpeedButton;
    Panel29: TPanel;
    SpeedButton4: TSpeedButton;
    qry_ConsultaConfronto: TFDQuery;
    qry_Grupo: TFDQuery;
    qry_ConsultaConfrontoCODIGO: TIntegerField;
    qry_ConsultaConfrontoCOMPETICAO: TIntegerField;
    qry_ConsultaConfrontoRODADA: TIntegerField;
    qry_ConsultaConfrontoNUMEROPARTIDA: TIntegerField;
    qry_ConsultaConfrontoCODSELECAO1: TIntegerField;
    qry_ConsultaConfrontoSELECAO1: TStringField;
    qry_ConsultaConfrontoCODSELECAO2: TIntegerField;
    qry_ConsultaConfrontoSELECAO2: TStringField;
    qry_ConsultaConfrontoGOLSELECAO1: TIntegerField;
    qry_ConsultaConfrontoGOLSELECAO2: TIntegerField;
    qry_ConsultaConfrontoVENCEDOR: TIntegerField;
    qry_ConsultaConfrontoENCERRADO: TStringField;
    qry_ConsultaConfrontoFLAGSELECAO1: TStringField;
    qry_ConsultaConfrontoFLAGSELECAO2: TStringField;
    qry_GrupoCODIGO: TIntegerField;
    qry_GrupoCOMPETICAO: TIntegerField;
    qry_GrupoGRUPO: TStringField;
    qry_GrupoSELECAO: TIntegerField;
    qry_GrupoPONTUACAO: TIntegerField;
    qry_GrupoSALDO: TIntegerField;
    qry_GrupoVITORIAS: TIntegerField;
    qry_GrupoEMPATES: TIntegerField;
    qry_GrupoDERROTAS: TIntegerField;
    qry_GrupoGOLSFEITOS: TIntegerField;
    qry_GrupoGOLSLEVADOS: TIntegerField;
    qry_GrupoPOTEORIGEM: TIntegerField;
    qry_GrupoRANKING: TIntegerField;
    qry_AtualizaRanking: TFDQuery;
    qry_AtualizaRankingCODIGO: TIntegerField;
    qry_AtualizaRankingCOMPETICAO: TIntegerField;
    qry_AtualizaRankingGRUPO: TStringField;
    qry_AtualizaRankingSELECAO: TIntegerField;
    qry_AtualizaRankingPONTUACAO: TIntegerField;
    qry_AtualizaRankingSALDO: TIntegerField;
    qry_AtualizaRankingVITORIAS: TIntegerField;
    qry_AtualizaRankingEMPATES: TIntegerField;
    qry_AtualizaRankingDERROTAS: TIntegerField;
    qry_AtualizaRankingGOLSFEITOS: TIntegerField;
    qry_AtualizaRankingGOLSLEVADOS: TIntegerField;
    qry_AtualizaRankingPOTEORIGEM: TIntegerField;
    qry_AtualizaRankingRANKING: TIntegerField;
    procedure FormShow(Sender: TObject);
    procedure GrupoABeforeOpen(DataSet: TDataSet);
    procedure GrupoACalcFields(DataSet: TDataSet);
    procedure GrupoASALDOGetText(Sender: TField; var Text: string;
      DisplayText: Boolean);
    procedure FormResize(Sender: TObject);
    procedure DBGrid4DrawColumnCell(Sender: TObject; const Rect: TRect;
      DataCol: Integer; Column: TColumn; State: TGridDrawState);
    procedure dbgConfrontosDrawColumnCell(Sender: TObject; const Rect: TRect;
      DataCol: Integer; Column: TColumn; State: TGridDrawState);
    procedure qry_ConfrontosCalcFields(DataSet: TDataSet);
    procedure qry_ConfrontosAfterOpen(DataSet: TDataSet);
    procedure PageControl1Change(Sender: TObject);
    procedure SpeedButton1Click(Sender: TObject);
    procedure SpeedButton2Click(Sender: TObject);
    procedure SpeedButton4Click(Sender: TObject);
  private
    { Private declarations }
    WPontuacaoTime1,
    WPontuacaoTime2: Integer;

    procedure ResizeBlocos();
    procedure PreencherBracket( pPanel: TPanel );
    function JogarPartida( idConfronto: Integer ):Boolean;
    procedure SalvarResultado( idConfronto: Integer );
    procedure AtualizarProximoConfronto();
    procedure AtualizarRanking( Grupo:String );
  public
    { Public declarations }
  end;

var
  FrmChaveamento: TFrmChaveamento;

implementation

{$R *.dfm}

uses UdmPrincipal;

procedure TFrmChaveamento.AtualizarProximoConfronto;
begin
  if not( qry_Confrontos.Locate( 'ENCERRADO', 'NÃO', [] ) ) then
  begin
    dmPrincipal.qry_Competicao.Edit;
    dmPrincipal.qry_CompeticaoRODADA.AsInteger := dmPrincipal.qry_CompeticaoRODADA.AsInteger + 1;
    dmPrincipal.qry_Competicao.Post;
    dmPrincipal.qry_Competicao.Connection.CommitRetaining;
  end;

  qry_Confrontos.Close;
  qry_Confrontos.Params.ParamByName( 'pCompeticao' ).AsInteger := dmPrincipal.qry_CompeticaoCODIGO.AsInteger;
  qry_Confrontos.Params.ParamByName( 'pRodada' ).AsInteger     := dmPrincipal.qry_CompeticaoRODADA.AsInteger;
  qry_Confrontos.Open();

  qry_ProximoConfronto.Close;
  qry_ProximoConfronto.Params.ParamByName( 'pCompeticao' ).AsInteger := dmPrincipal.qry_CompeticaoCODIGO.AsInteger;
  qry_ProximoConfronto.Open();

  Image63.Picture.LoadFromFile( qry_ProximoConfrontoFLAGSELECAO1.AsString );
  Label2.Caption := qry_ProximoConfrontoSELECAO1.AsString;
  Image64.Picture.LoadFromFile( qry_ProximoConfrontoFLAGSELECAO2.AsString );
  Label4.Caption := qry_ProximoConfrontoSELECAO2.AsString;
end;

procedure TFrmChaveamento.AtualizarRanking(Grupo:String);
begin
  //
end;

procedure TFrmChaveamento.dbgConfrontosDrawColumnCell(Sender: TObject;
  const Rect: TRect; DataCol: Integer; Column: TColumn; State: TGridDrawState);
var
  JPEGImg: TJPEGImage;
  Caminho: string;
begin
  if ( Column.Field.DataSet.Fields.FieldByName( 'ENCERRADO' ).AsString = 'SIM' ) then
  begin
    dbgConfrontos.Canvas.Brush.Color := $00E1FFFF;
  end
  else
  begin
    dbgConfrontos.Canvas.Brush.Color := $00FFF4E1;
  end;

  if Column.FieldName = 'FLAGSELECAO1' then
  begin
    DBGrid1.Canvas.FillRect(Rect);

    Caminho := Column.Field.AsString;

    if (Caminho <> '') and FileExists(Caminho) then
    begin
      JPEGImg := TJPEGImage.Create;
      try
        JPEGImg.LoadFromFile(Caminho);
        dbgConfrontos.Canvas.StretchDraw(Rect, JPEGImg);
      finally
        JPEGImg.Free;
      end;
    end;
  end;

  if Column.FieldName = 'FLAGSELECAO2' then
  begin
    DBGrid1.Canvas.FillRect(Rect);

    Caminho := Column.Field.AsString;

    if (Caminho <> '') and FileExists(Caminho) then
    begin
      JPEGImg := TJPEGImage.Create;
      try
        JPEGImg.LoadFromFile(Caminho);
        dbgConfrontos.Canvas.StretchDraw(Rect, JPEGImg);
      finally
        JPEGImg.Free;
      end;
    end;
  end;

//  dbgConfrontos.DefaultDrawColumnCell(Rect, DataCol, Column, State);
end;

procedure TFrmChaveamento.DBGrid4DrawColumnCell(Sender: TObject;
  const Rect: TRect; DataCol: Integer; Column: TColumn; State: TGridDrawState);
begin
  if ( Column.Field.DataSet.Fields.FieldByName( 'RANKING' ).AsInteger > 3) then
    TDBGrid(Sender).Canvas.Brush.Color := $00E6E6FF
  else if (Column.Field.DataSet.Fields.FieldByName( 'RANKING' ).AsInteger = 3) then
    TDBGrid(Sender).Canvas.Brush.Color := $00DDFDFF
  else
    TDBGrid(Sender).Canvas.Brush.Color := $00CAFFCA;

  TDBGrid(Sender).DefaultDrawColumnCell(Rect, DataCol, Column, State);

end;

procedure TFrmChaveamento.FormResize(Sender: TObject);
begin
  ResizeBlocos();
end;

procedure TFrmChaveamento.FormShow(Sender: TObject);
begin
  GrupoA.Close;
  GrupoA.Open();

  Grupob.Close;
  Grupob.Open();

  Grupoc.Close;
  Grupoc.Open();

  Grupod.Close;
  Grupod.Open();

  Grupoe.Close;
  Grupoe.Open();

  Grupof.Close;
  Grupof.Open();

  Grupog.Close;
  Grupog.Open();

  Grupoh.Close;
  Grupoh.Open();

  Grupoi.Close;
  Grupoi.Open();

  Grupoj.Close;
  Grupoj.Open();

  Grupok.Close;
  Grupok.Open();

  Grupol.Close;
  Grupol.Open();

  qry_Confrontos.Close;
  qry_Confrontos.Params.ParamByName( 'pCompeticao' ).AsInteger := dmPrincipal.qry_CompeticaoCODIGO.AsInteger;
  qry_Confrontos.Params.ParamByName( 'pRodada' ).AsInteger     := 1;
  qry_Confrontos.Open();

  AtualizarProximoConfronto;

  ResizeBlocos();
end;

procedure TFrmChaveamento.GrupoABeforeOpen(DataSet: TDataSet);
begin
  TFDQuery(Dataset).Params.ParamByName( 'pCompeticao' ).AsInteger := dmPrincipal.qry_CompeticaoCODIGO.AsInteger;
end;

procedure TFrmChaveamento.GrupoACalcFields(DataSet: TDataSet);
begin
  DataSet.Fields.FieldByName( 'rank' ).AsInteger := Dataset.RecNo;
end;

procedure TFrmChaveamento.GrupoASALDOGetText(Sender: TField; var Text: string;
  DisplayText: Boolean);
begin
  if (DisplayText) then
  begin
    if ( Sender.AsInteger > 0 ) then
      Text := '+' + Sender.AsString
    else
      Text := Sender.AsString
  end;
end;

function TFrmChaveamento.JogarPartida(idConfronto: Integer):Boolean;
var
  i,
  PontosTime1,
  PontosTime2,
  BuffTime1, BuffTime2,
  SorteioTime1,
  SorteioTime2: Integer;
begin
  PontosTime1 := 0;
  PontosTime2 := 0;

  qry_ConsultaConfronto.Close;
  qry_ConsultaConfronto.Params.ParamByName( 'pCodigo' ).AsInteger := idConfronto;
  qry_ConsultaConfronto.Open();

  if not( qry_ConsultaConfrontoCODSELECAO1.IsNull ) then
  begin
    dmPrincipal.qry_Times.Close;
    dmPrincipal.qry_Times.SQL.Clear;
    dmPrincipal.qry_Times.SQL.Add('Select * from TTIMES where CODIGO = ' + QuotedStr(qry_ConsultaConfrontoCODSELECAO1.AsString) );
    dmPrincipal.qry_Times.Open();
    BuffTime1 := dmPrincipal.qry_TimesPONTUACAO.AsInteger;
  end;

  if not( qry_ConsultaConfrontoCODSELECAO2.IsNull ) then
  begin
    dmPrincipal.qry_Times.Close;
    dmPrincipal.qry_Times.SQL.Clear;
    dmPrincipal.qry_Times.SQL.Add('Select * from TTIMES where CODIGO = ' + QuotedStr(qry_ConsultaConfrontoCODSELECAO2.AsString) );
    dmPrincipal.qry_Times.Open();
    BuffTime2 := dmPrincipal.qry_TimesPONTUACAO.AsInteger;
  end;

  for i := 1 to 3 do
  begin
    randomize;
    SorteioTime1 := Random(7) + (BuffTime1 div 20);
    randomize;
    SorteioTime2 := Random(7) + (BuffTime2 div 20);

    if SorteioTime1 > SorteioTime2 then
      Inc(PontosTime1)
    else if SorteioTime2 > SorteioTime1 then
      Inc(PontosTime2);
  end;

  WPontuacaoTime1 := PontosTime1;
  WPontuacaoTime2 := PontosTime2;

end;

procedure TFrmChaveamento.PageControl1Change(Sender: TObject);
begin
  if ( PageControl1.ActivePage = tbsEliminatorias ) then
  begin
    PreencherBracket( p73_1 );
    PreencherBracket( p73_2 );
    PreencherBracket( p74_1 );
    PreencherBracket( p74_2 );
    PreencherBracket( p75_1 );
    PreencherBracket( p75_2 );
    PreencherBracket( p76_1 );
    PreencherBracket( p76_2 );

    PreencherBracket( p77_1 );
    PreencherBracket( p77_2 );
    PreencherBracket( p78_1 );
    PreencherBracket( p78_2 );
    PreencherBracket( p79_1 );
    PreencherBracket( p79_2 );
    PreencherBracket( p80_1 );
    PreencherBracket( p80_2 );


    PreencherBracket( p81_1 );
    PreencherBracket( p81_2 );
    PreencherBracket( p82_1 );
    PreencherBracket( p82_2 );
    PreencherBracket( p83_1 );
    PreencherBracket( p83_2 );
    PreencherBracket( p84_1 );
    PreencherBracket( p84_2 );

    PreencherBracket( p85_1 );
    PreencherBracket( p85_2 );
    PreencherBracket( p86_1 );
    PreencherBracket( p86_2 );
    PreencherBracket( p87_1 );
    PreencherBracket( p87_2 );
    PreencherBracket( p88_1 );
    PreencherBracket( p88_2 );

    PreencherBracket( p89_1 );
    PreencherBracket( p89_2 );
    PreencherBracket( p90_1 );
    PreencherBracket( p90_2 );
    PreencherBracket( p91_1 );
    PreencherBracket( p91_2 );
    PreencherBracket( p92_1 );
    PreencherBracket( p92_2 );

    PreencherBracket( p93_1 );
    PreencherBracket( p93_2 );
    PreencherBracket( p94_1 );
    PreencherBracket( p94_2 );
    PreencherBracket( p95_1 );
    PreencherBracket( p95_2 );
    PreencherBracket( p96_1 );
    PreencherBracket( p96_2 );

    PreencherBracket( p97_1 );
    PreencherBracket( p97_2 );
    PreencherBracket( p98_1 );
    PreencherBracket( p98_2 );
    PreencherBracket( p99_1 );
    PreencherBracket( p99_2 );
    PreencherBracket( p100_1 );
    PreencherBracket( p100_2 );

    PreencherBracket( p101_1 );
    PreencherBracket( p101_2 );
    PreencherBracket( p102_1 );
    PreencherBracket( p102_2 );
//    PreencherBracket( p103_1 );
//    PreencherBracket( p103_2 );
    PreencherBracket( p104_1 );
    PreencherBracket( p104_2 );
  end
  ELSE if (PageControl1.ActivePage = tabGrupos) then
  begin
    GrupoA.Refresh;
    GrupoB.Refresh;
    GrupoC.Refresh;
    GrupoD.Refresh;
    GrupoE.Refresh;
    GrupoF.Refresh;
    GrupoG.Refresh;
    GrupoH.Refresh;
    GrupoI.Refresh;
    GrupoJ.Refresh;
    GrupoK.Refresh;
    GrupoL.Refresh;
  end;

end;

procedure TFrmChaveamento.PreencherBracket(pPanel: TPanel);
var
  NumPartida, indexSelecao: Integer;
  img: TImage;
begin
  NumPartida   := StrToInt( Copy( pPanel.Name, 2, Length(pPanel.Name)-3 ) );
  indexSelecao := StrToInt( Copy( pPanel.Name, Pos('_', pPanel.Name) + 1, 1) );
  img := TImage(pPanel.Controls[0]);

  qry_Bracket.Close;
  qry_Bracket.Params.ParamByName( 'pCompeticao' ).AsInteger := dmPrincipal.qry_CompeticaoCODIGO.AsInteger;
  qry_Bracket.Params.ParamByName( 'pNumPartida' ).AsInteger := NumPartida;
  qry_Bracket.Open();

  if ( indexSelecao = 1 ) then
  begin
    pPanel.Caption := ' '+ qry_BracketSELECAO1.AsString;
    img.Picture.LoadFromFile( qry_BracketFLAGSELECAO1.AsString );
  end else if ( indexSelecao = 2 ) then
  begin
    pPanel.Caption := ' ' +qry_BracketSELECAO2.AsString;
    img.Picture.LoadFromFile( qry_BracketFLAGSELECAO2.AsString );
  end

end;

procedure TFrmChaveamento.qry_ConfrontosAfterOpen(DataSet: TDataSet);
begin
//  // Esta é a maneira correta de acessar
//  SendMessage(dbgConfrontos.Handle, WM_SETREDRAW, 0, 0); // Desabilita redraw
//  try
//    dbgConfrontos.ClientHeight := (qry_Confrontos.RecordCount + 1) * 100; // Altura aproximada
//    // A altura da linha é controlada pela fonte e padding
//  finally
//    SendMessage(dbgConfrontos.Handle, WM_SETREDRAW, 1, 0); // Habilita redraw
//    dbgConfrontos.Invalidate; // Redesenha
//  end;
end;

procedure TFrmChaveamento.qry_ConfrontosCalcFields(DataSet: TDataSet);
begin
  qry_ConfrontosVERSUS.AsString := 'x';
end;

procedure TFrmChaveamento.ResizeBlocos;
var
  iWidth: Integer;
begin
  iWidth := Trunc(Self.Width / 4);

  Panel2.Width  := iWidth;
  Panel3.Width  := iWidth;
  Panel6.Width  := iWidth;
  Panel8.Width  := iWidth;
  Panel11.Width := iWidth;
  Panel13.Width := iWidth;
  Panel15.Width := iWidth;
  Panel17.Width := iWidth;
  Panel20.Width := iWidth;
  Panel22.Width := iWidth;
  Panel24.Width := iWidth;
  Panel26.Width := iWidth;

  dbgConfrontos.Top  := 0;
  dbgConfrontos.Left := Trunc( (Panel150.Width - dbgConfrontos.Width) / 2 );

  pnlProximoConfronto.Left := Trunc( (Panel152.Width - pnlProximoConfronto.Width) / 2 );
  pnljogar.Left := Trunc( (Panel152.Width - pnljogar.Width) / 2 );

  Panel153.Left := Trunc( (tbsRodada.Width - Panel153.Width) / 2 );
end;

procedure TFrmChaveamento.SalvarResultado(idConfronto: Integer);
var
  iDiferenca: Integer;
  sGrupo: String;
begin
  qry_ConsultaConfronto.Close;
  qry_ConsultaConfronto.Params.ParamByName( 'pCodigo' ).AsInteger := idConfronto;
  qry_ConsultaConfronto.Open();

  if not( qry_ConsultaConfronto.IsEmpty ) then
  begin
    qry_ConsultaConfronto.Edit;
    qry_ConsultaConfrontoGOLSELECAO1.AsInteger := WPontuacaoTime1;
    qry_ConsultaConfrontoGOLSELECAO2.AsInteger := WPontuacaoTime2;
    qry_ConsultaConfrontoENCERRADO.AsString    := 'SIM';

    if WPontuacaoTime1 > WPontuacaoTime2 then
      qry_ConsultaConfrontoVENCEDOR.AsInteger  := qry_ConsultaConfrontoCODSELECAO1.AsInteger
    else if WPontuacaoTime2 > WPontuacaoTime1 then
      qry_ConsultaConfrontoVENCEDOR.AsInteger  := qry_ConsultaConfrontoCODSELECAO2.AsInteger;

    qry_ConsultaConfronto.Post;
    qry_ConsultaConfronto.Connection.CommitRetaining;

    if ( dmPrincipal.qry_CompeticaoRODADA.AsInteger <= 3 ) then
    begin
      qry_Grupo.Close;
      qry_Grupo.Params.ParamByName('pCompeticao').AsInteger := dmPrincipal.qry_CompeticaoCODIGO.AsInteger;
      qry_Grupo.Params.ParamByName('pTime').AsInteger := qry_ConsultaConfrontoCODSELECAO1.AsInteger;
      qry_Grupo.Open;
      if not(qry_Grupo.IsEmpty) then
      begin
        iDiferenca := WPontuacaoTime1 - WPontuacaoTime2;

        qry_Grupo.Edit;

        qry_GrupoSALDO.AsInteger       := qry_GrupoSALDO.AsInteger + iDiferenca;
        qry_GrupoGOLSFEITOS.AsInteger  := qry_GrupoGOLSFEITOS.AsInteger + WPontuacaoTime1;
        qry_GrupoGOLSLEVADOS.AsInteger := qry_GrupoGOLSLEVADOS.AsInteger + WPontuacaoTime2;

        if WPontuacaoTime1 > WPontuacaoTime2 then
        begin
          qry_GrupoPONTUACAO.AsInteger := qry_GrupoPONTUACAO.AsInteger + 3;
          qry_GrupoVITORIAS.AsInteger  := qry_GrupoVITORIAS.AsInteger + 1
        end
        else if WPontuacaoTime2 > WPontuacaoTime1 then
          qry_GrupoDERROTAS.AsInteger := qry_GrupoDERROTAS.AsInteger + 1
        else
        begin
          qry_GrupoPONTUACAO.AsInteger := qry_GrupoPONTUACAO.AsInteger + 1;
          qry_GrupoEMPATES.AsInteger := qry_GrupoEMPATES.AsInteger + 1;
        end;


        qry_Grupo.Post;
        qry_Grupo.Connection.CommitRetaining;
      end;

      qry_Grupo.Close;
      qry_Grupo.Params.ParamByName('pCompeticao').AsInteger := dmPrincipal.qry_CompeticaoCODIGO.AsInteger;
      qry_Grupo.Params.ParamByName('pTime').AsInteger       := qry_ConsultaConfrontoCODSELECAO2.AsInteger;
      qry_Grupo.Open;
      if not(qry_Grupo.IsEmpty) then
      begin
        iDiferenca := WPontuacaoTime2 - WPontuacaoTime1;

        qry_Grupo.Edit;

        qry_GrupoSALDO.AsInteger       := qry_GrupoSALDO.AsInteger + iDiferenca;
        qry_GrupoGOLSFEITOS.AsInteger  := qry_GrupoGOLSFEITOS.AsInteger + WPontuacaoTime2;
        qry_GrupoGOLSLEVADOS.AsInteger := qry_GrupoGOLSLEVADOS.AsInteger + WPontuacaoTime1;

        if WPontuacaoTime2 > WPontuacaoTime1 then
        begin
          qry_GrupoPONTUACAO.AsInteger := qry_GrupoPONTUACAO.AsInteger + 3;
          qry_GrupoVITORIAS.AsInteger  := qry_GrupoVITORIAS.AsInteger + 1
        end
        else if WPontuacaoTime1 > WPontuacaoTime2 then
          qry_GrupoDERROTAS.AsInteger  := qry_GrupoDERROTAS.AsInteger + 1
        else
        begin
          qry_GrupoPONTUACAO.AsInteger := qry_GrupoPONTUACAO.AsInteger + 1;
          qry_GrupoEMPATES.AsInteger   := qry_GrupoEMPATES.AsInteger + 1;
        end;


        qry_Grupo.Post;
        qry_Grupo.Connection.CommitRetaining;
      end;

      sGrupo := qry_GrupoGRUPO.AsString;

      qry_AtualizaRanking.Close;
      qry_AtualizaRanking.Params.ParamByName( 'pCompeticao' ).AsInteger := dmPrincipal.qry_CompeticaoCODIGO.AsInteger;
      qry_AtualizaRanking.Params.ParamByName( 'pGrupo' ).AsString       := sGrupo;
      qry_AtualizaRanking.Open();
      qry_AtualizaRanking.First;
      while not( qry_AtualizaRanking.Eof ) do
      begin
        qry_AtualizaRanking.Edit;
        qry_AtualizaRankingRANKING.AsInteger := qry_AtualizaRanking.RecNo;
        qry_AtualizaRanking.Post;
        qry_AtualizaRanking.Connection.CommitRetaining;

        qry_AtualizaRanking.Next;
      end;

    end;

    qry_Confrontos.Refresh;
    AtualizarProximoConfronto;



  end;
end;

procedure TFrmChaveamento.SpeedButton1Click(Sender: TObject);
begin
  if (( qry_ProximoConfronto.Active ) and not(qry_ProximoConfronto.IsEmpty)) then
  begin
    if (JogarPartida( qry_ProximoConfrontoCODIGO.AsInteger )) then
    begin
      pnlPartida.Caption := IntToStr(WPontuacaoTime1) + '  x  ' + IntToStr(WPontuacaoTime2);
      pnlPartida.Left    := Trunc( (tbsRodada.Width - pnlPartida.Width) / 2 );
      pnlPartida.Visible := True;
    end;
  end;



end;

procedure TFrmChaveamento.SpeedButton2Click(Sender: TObject);
begin
  if (( qry_ProximoConfronto.Active ) and not(qry_ProximoConfronto.IsEmpty)) then
  begin
    if (JogarPartida( qry_ProximoConfrontoCODIGO.AsInteger )) then
    begin
      pnlPartida.Caption := IntToStr(WPontuacaoTime1) + '  x  ' + IntToStr(WPontuacaoTime2);
      pnlPartida.Left    := Trunc( (tbsRodada.Width - pnlPartida.Width) / 2 );
      pnlPartida.Top     := Panel153.Top - 70;
      pnlPartida.Visible := True;
    end;
  end;
end;

procedure TFrmChaveamento.SpeedButton4Click(Sender: TObject);
begin
  if (( qry_ProximoConfronto.Active ) and not(qry_ProximoConfronto.IsEmpty)) then
  begin
    SalvarResultado( qry_ProximoConfrontoCODIGO.AsInteger );
  end;

  pnlPartida.Visible := False;;
end;

end.
