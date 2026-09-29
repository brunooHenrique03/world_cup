program WorldCup;

uses
  Vcl.Forms,
  UPrincipal in 'forms\UPrincipal.pas' {FrmPrincipal},
  UdmPrincipal in 'forms\UdmPrincipal.pas' {dmPrincipal: TDataModule},
  USelecoes in 'forms\USelecoes.pas' {FrmListagemSelecoes},
  UnitConfiguracoes in 'forms\UnitConfiguracoes.pas' {FrmConfiguracoesCompeticao},
  UDefinirParticipantes in 'forms\UDefinirParticipantes.pas' {FrmDefinirParticipantes},
  USorteioGrupos in 'forms\USorteioGrupos.pas' {FrmSorteioGrupos},
  UnitChaveamento in 'forms\UnitChaveamento.pas' {FrmChaveamento};

{$R *.res}

begin
  Application.Initialize;
  Application.MainFormOnTaskbar := True;
  Application.CreateForm(TFrmPrincipal, FrmPrincipal);
  Application.CreateForm(TdmPrincipal, dmPrincipal);
  Application.CreateForm(TFrmSorteioGrupos, FrmSorteioGrupos);
  Application.CreateForm(TFrmChaveamento, FrmChaveamento);
  ;
  Application.Run;
end.
