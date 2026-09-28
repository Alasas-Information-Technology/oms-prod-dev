const fs = require('fs');
const path = 'components/organization/OrgUnitDetailView.tsx';
let content = fs.readFileSync(path, 'utf8');

const returnStartIdx = content.indexOf('  return (', content.indexOf('const effectiveHeadSince ='));
const returnEndIdx = content.lastIndexOf('  );');

if (returnStartIdx === -1 || returnEndIdx === -1) {
  console.error("Could not find bounds");
  process.exit(1);
}

const replacement = `  return (
    <div className={cn("flex flex-col h-full bg-muted/10", className)}>
      {/* ── HEADER ── */}
      <div className="bg-background border-b border-border shrink-0">
        <div className="px-6 sm:px-8 pt-8 pb-6">
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-start gap-4 min-w-0">
              <div className="size-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-md">
                <OrgTypeIcon type={typeCode || "DEPARTMENT"} size="detail" />
              </div>
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold font-display tracking-tight text-foreground truncate">
                    {unit.name}
                  </h1>
                  <Badge className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-muted/80 text-muted-foreground border border-border/60 shadow-none hover:bg-muted/80 select-none">
                    {unit.code}
                  </Badge>
                </div>
                {unit.nameAr && (
                  <p dir="rtl" lang="ar" className="text-sm text-muted-foreground font-arabic truncate">
                    {unit.nameAr}
                  </p>
                )}
                
                <div className="text-xs font-semibold text-muted-foreground flex items-center gap-2 flex-wrap pt-1">
                  {breadcrumbItems.length > 0 ? (
                    breadcrumbItems.map((item, idx) => (
                      <React.Fragment key={item.orgUnitId || idx}>
                        {idx > 0 && <span className="text-muted-foreground/30">/</span>}
                        <button
                          type="button"
                          onClick={() => item.orgUnitId && onNavigateUnit?.(item.orgUnitId)}
                          className="hover:text-primary transition-colors truncate max-w-[120px] sm:max-w-[200px]"
                        >
                          {item.name}
                        </button>
                      </React.Fragment>
                    ))
                  ) : (
                    <span className="text-foreground">Top Level Organization</span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {can(ORG_PERMISSIONS.UPDATE) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditOpen(true)}
                  className="h-9 px-3.5 gap-2 text-xs font-bold shadow-xs bg-card"
                >
                  <Edit2 className="size-3.5 text-muted-foreground" />
                  Edit
                </Button>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="size-9 p-0 shadow-xs bg-card"
                  >
                    <MoreHorizontal className="size-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 p-1">
                  {can(ORG_PERMISSIONS.MOVE) && (
                    <DropdownMenuItem
                      onClick={() => setIsMoveOpen(true)}
                      className="gap-2 text-xs font-medium cursor-pointer rounded-sm"
                    >
                      <ArrowRightLeft className="size-3.5 text-blue-600" />
                      <span>Move {typeName.toLowerCase()}</span>
                    </DropdownMenuItem>
                  )}
                  {can(ORG_PERMISSIONS.UPDATE) && (
                    <DropdownMenuItem
                      onClick={() => setIsArchiveOpen(true)}
                      className="gap-2 text-xs font-medium cursor-pointer rounded-sm"
                    >
                      <Archive className="size-3.5 text-amber-600" />
                      <span>{unit.isActive ? \`Archive \${typeName.toLowerCase()}\` : \`Restore \${typeName.toLowerCase()}\`}</span>
                    </DropdownMenuItem>
                  )}
                  {can(ORG_PERMISSIONS.DELETE) && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setIsDeleteOpen(true)}
                        className="gap-2 text-xs font-medium text-destructive focus:text-destructive cursor-pointer rounded-sm"
                      >
                        <Trash2 className="size-3.5" />
                        <span>Remove {typeName.toLowerCase()}</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="px-6 sm:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="h-11 w-full bg-transparent p-0 flex justify-start gap-8 border-none">
              {["overview", "children", "people", "history"].map((tab) => {
                const labels: Record<string, string> = {
                  overview: "Overview",
                  children: childMeta.tabLabel,
                  people: "People",
                  history: "History",
                };
                const counts: Record<string, number | undefined> = {
                  children: childrenList?.length,
                  people: (unit as any).peopleCount ?? (unit as any).assignedUserCount,
                  history: changeLogsData?.total,
                };
                
                return (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="h-11 px-0 pb-3 pt-2 text-xs font-bold tracking-wide text-muted-foreground rounded-none bg-transparent data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none relative transition-none data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:inset-x-0 data-[state=active]:after:h-[2px] data-[state=active]:after:bg-primary data-[state=active]:after:rounded-t-full"
                  >
                    {labels[tab]}
                    {counts[tab] ? (
                      <Badge variant="secondary" className="ml-2 text-[10px] font-bold px-1.5 py-0 h-[18px] bg-muted/80 text-muted-foreground border-border/50">
                        {counts[tab]}
                      </Badge>
                    ) : null}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      {/* ── TAB CONTENT ── */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-8">
        <Tabs value={activeTab} className="h-full">
           
           {/* OVERVIEW */}
           <TabsContent value="overview" className="m-0 focus-visible:outline-none space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                 
                 {/* Properties */}
                 <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                      <FileQuestion className="size-3.5" />
                      Properties
                    </h3>
                    <div className="space-y-1">
                       <div className="flex justify-between items-center py-2.5 border-b border-border/40 last:border-0">
                         <span className="text-xs font-semibold text-muted-foreground">Status</span>
                         <Badge variant="outline" className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5", unit.isActive ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20" : "bg-muted text-muted-foreground")}>
                            {unit.isActive ? "Active" : "Archived"}
                         </Badge>
                       </div>
                       <div className="flex justify-between items-center py-2.5 border-b border-border/40 last:border-0">
                         <span className="text-xs font-semibold text-muted-foreground">Cost Centre</span>
                         <span className="text-sm font-bold text-foreground">{unit.costCenterCode || "None"}</span>
                       </div>
                       <div className="flex justify-between items-center py-2.5 border-b border-border/40 last:border-0">
                         <span className="text-xs font-semibold text-muted-foreground">Sub-units</span>
                         <span className="text-sm font-bold text-foreground">{countSentence}</span>
                       </div>
                    </div>
                 </div>

                 {/* Leadership */}
                 <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                        <Crown className="size-3.5" />
                        Leadership
                      </h3>
                      {can(ORG_PERMISSIONS.MANAGE_MANAGERS) && !isHeadAssigned && (
                        <button type="button" onClick={() => setActiveTab("people")} className="text-[11px] font-bold text-primary hover:underline">
                          Assign
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-4 pt-1">
                       <div className="size-12 rounded-xl bg-muted flex items-center justify-center border border-border/50 shadow-xs shrink-0 text-muted-foreground font-bold text-sm">
                         {isHeadAssigned ? getInitials(headName) : <User className="size-5 opacity-40" />}
                       </div>
                       <div className="min-w-0">
                         <p className="text-sm font-bold text-foreground truncate">{isHeadAssigned ? headName : "Unassigned"}</p>
                         <p className="text-xs font-semibold text-muted-foreground mt-0.5 truncate">{isHeadAssigned ? \`Head · Since \${formatDisplayDate(effectiveHeadSince)}\` : "No active leader"}</p>
                       </div>
                    </div>
                 </div>

                 {/* Budget */}
                 <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                      <FileQuestion className="size-3.5" />
                      Budget Owner
                    </h3>
                    <div className="pt-1">
                      {isLoadingBudget ? (
                        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                          <Loader2 className="size-3.5 animate-spin" />
                          <span>Checking...</span>
                        </div>
                      ) : budgetOwner ? (
                        <div>
                          <p className="text-sm font-bold text-foreground">{budgetOwner.name}</p>
                          <p className="text-xs font-semibold text-muted-foreground mt-0.5">{budgetOwner.code}</p>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <p className="text-sm font-semibold text-muted-foreground">Not assigned</p>
                          {can(ORG_PERMISSIONS.UPDATE) && (
                            <button type="button" onClick={() => setIsEditOpen(true)} className="text-[11px] font-bold text-primary hover:underline block">
                              Set budget owner
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                 </div>

                 {/* Signoff Chain */}
                 <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                      <ArrowRightLeft className="size-3.5" />
                      Approval Route
                    </h3>
                    <div className="pt-1">
                      {isLoadingChain ? (
                        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                          <Loader2 className="size-3.5 animate-spin" />
                          <span>Loading path...</span>
                        </div>
                      ) : approvalChain && approvalChain.length > 0 ? (
                        <div className="relative pl-1">
                          {approvalChain.map((node, idx) => {
                            const isLast = idx === approvalChain.length - 1;
                            const headPerson = node.head?.displayName;
                            const hasHead = Boolean(headPerson && headPerson !== "Assigned Head");

                            return (
                              <div key={node.orgUnitId || idx} className="relative flex items-start gap-4 pb-5 last:pb-0">
                                {!isLast && (
                                  <div className="absolute left-[7px] top-[20px] bottom-0 w-[2px] bg-muted" />
                                )}
                                <div className="relative z-10 size-4 rounded-full bg-background border-2 border-primary/40 flex items-center justify-center shrink-0 mt-0.5">
                                  <div className={cn("size-1.5 rounded-full", hasHead ? "bg-primary" : "bg-muted-foreground/40")} />
                                </div>
                                <div className="min-w-0 flex-1 -mt-0.5">
                                  <p className="text-xs font-bold text-foreground leading-snug truncate">
                                    {node.name}
                                  </p>
                                  <p className="text-[11px] font-semibold text-muted-foreground mt-0.5 leading-snug truncate">
                                    {hasHead ? headPerson : "No one in charge"}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs font-semibold text-muted-foreground">No sign-off route required.</p>
                      )}
                    </div>
                 </div>

              </div>
           </TabsContent>

           {/* CHILDREN */}
           <TabsContent value="children" className="m-0 focus-visible:outline-none h-full">
             <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden flex flex-col h-full min-h-[400px]">
               <div className="p-5 border-b border-border/50 flex items-center justify-between gap-4">
                 <div>
                   <h3 className="text-sm font-bold text-foreground">{childMeta.tabLabel}</h3>
                   <p className="text-xs font-semibold text-muted-foreground mt-0.5">
                     Teams and divisions inside {unit.name}.
                   </p>
                 </div>
                 {can(ORG_PERMISSIONS.CREATE) && (
                   <Button size="sm" onClick={() => setIsAddChildOpen(true)} className="gap-1.5 text-xs font-bold shadow-xs">
                     <Plus className="size-3.5" />
                     Add {childMeta.singularLabel}
                   </Button>
                 )}
               </div>
               <div className="p-0 flex-1">
                 <DataTable
                   columns={childrenColumns}
                   data={childrenList || []}
                   keyField="orgUnitId"
                   loading={isLoadingChildren}
                   onRowClick={(row) => onNavigateUnit?.(row.orgUnitId)}
                   emptyMessage={\`No \${childMeta.tabLabel.toLowerCase()} added under \${unit.name} yet.\`}
                 />
               </div>
             </div>
           </TabsContent>

           {/* PEOPLE */}
           <TabsContent value="people" className="m-0 focus-visible:outline-none">
             <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
               <ManagerAssignmentPanel orgUnitId={unit.orgUnitId} unitName={unit.name} />
             </div>
           </TabsContent>

           {/* HISTORY */}
           <TabsContent value="history" className="m-0 focus-visible:outline-none">
             <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
               <div className="p-5 border-b border-border/50">
                 <h3 className="text-sm font-bold text-foreground">Change Log</h3>
                 <p className="text-xs font-semibold text-muted-foreground mt-0.5">
                   Plain-language record of reporting changes, appointments, and structure updates.
                 </p>
               </div>
               <div className="p-5">
                 {isLoadingLogs ? (
                   <div className="py-8 text-center flex flex-col items-center justify-center space-y-2 text-xs font-semibold text-muted-foreground">
                     <Loader2 className="size-5 animate-spin text-primary" />
                     <span>Loading history records...</span>
                   </div>
                 ) : changeLogsData?.data && changeLogsData.data.length > 0 ? (
                   <div className="space-y-4 divide-y divide-border/50">
                     {changeLogsData.data.map((log) => {
                       const isMove = log.changeType === "MOVED" || log.changeType === "REPARENT";
                       const oldParent = log.oldValues?.parentName || log.oldValues?.parentOrgUnitId || "DIEZ";
                       const newParent = log.newValues?.parentName || log.newValues?.parentOrgUnitId || "DIEZ";
                       const operator = log.performedByDisplayName || log.performedBy || "Administrator";
                       const formattedDate = log.performedAt
                         ? new Date(log.performedAt).toLocaleDateString("en-GB", {
                             day: "numeric",
                             month: "long",
                             year: "numeric",
                           })
                         : "Recently";

                       let sentence = \`\${unit.name} updated — \${operator}, \${formattedDate}\`;
                       if (isMove) {
                         sentence = \`Moved from \${oldParent} to \${newParent} — \${operator}, \${formattedDate}\`;
                       } else if (log.changeType === "MANAGER_ASSIGNED") {
                         sentence = \`Assigned leader — \${operator}, \${formattedDate}\`;
                       } else if (log.changeType === "CREATED") {
                         sentence = \`Created under \${newParent} — \${operator}, \${formattedDate}\`;
                       } else if (log.changeType === "DEACTIVATED") {
                         sentence = \`Archived — \${operator}, \${formattedDate}\`;
                       } else if (log.changeType === "ACTIVATED") {
                         sentence = \`Restored — \${operator}, \${formattedDate}\`;
                       }

                       const friendlyTag =
                         isMove ? "Move" :
                         log.changeType === "CREATED" ? "Created" :
                         log.changeType === "DEACTIVATED" ? "Archived" :
                         log.changeType === "ACTIVATED" ? "Restored" :
                         log.changeType === "MANAGER_ASSIGNED" ? "Leadership" : "Update";

                       return (
                         <div key={log.changeLogId} className="pt-4 first:pt-0 flex flex-col gap-1.5">
                           <div className="flex items-center justify-between gap-3">
                             <p className="text-[13px] font-bold text-foreground leading-snug">
                               {sentence}
                             </p>
                             <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-muted/60 border border-border/50 shadow-none">
                               {friendlyTag}
                             </Badge>
                           </div>
                           {isMove && log.affectedNodeCount !== undefined && log.affectedNodeCount > 0 && (
                             <p className="text-xs font-semibold text-muted-foreground">
                               {log.affectedNodeCount} teams inside moved with it.
                             </p>
                           )}
                           {log.reason && (
                             <p className="text-xs font-semibold text-muted-foreground">
                               Reason: {log.reason}
                             </p>
                           )}
                         </div>
                       );
                     })}
                   </div>
                 ) : (
                   <div className="py-8 text-center text-xs font-semibold text-muted-foreground">
                     No history records logged for this {typeName.toLowerCase()} yet.
                   </div>
                 )}
               </div>
             </div>
           </TabsContent>

        </Tabs>
      </div>

      {/* ========================================================================= */}
      {/* Dialogs: Edit, Add, Move, Remove                                         */}
      {/* ========================================================================= */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-display">Edit {typeName}</DialogTitle>
            <DialogDescription className="text-sm font-semibold">
              Update properties for <span className="font-bold text-foreground">{unit.name}</span>.
            </DialogDescription>
          </DialogHeader>
          <OrgUnitForm
            initialData={unit}
            onSubmit={handleUpdateSubmit}
            onCancel={() => setIsEditOpen(false)}
            isLoading={updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isAddChildOpen} onOpenChange={setIsAddChildOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-display">Add {childMeta.singularLabel}</DialogTitle>
            <DialogDescription className="text-sm font-semibold">
              Add a new {childMeta.singularLabel.toLowerCase()} under{" "}
              <span className="font-bold text-foreground">{unit.name}</span>.
            </DialogDescription>
          </DialogHeader>
          <AddOrgUnitWizard
            initialParent={unit}
            targetTypeId={childMeta.targetTypeId}
            onSubmit={handleAddChildSubmit}
            onCancel={() => setIsAddChildOpen(false)}
            isLoading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <MoveUnitDialog
        open={isMoveOpen}
        onOpenChange={setIsMoveOpen}
        unit={unit}
        onSuccess={() => refetchUnit()}
      />

      <ArchiveUnitDialog
        open={isArchiveOpen}
        onOpenChange={setIsArchiveOpen}
        unit={unit}
        onSuccess={() => refetchUnit()}
      />

      <DeleteUnitDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        unit={unit}
        onNavigateToTab={(tab) => setActiveTab(tab)}
        onOpenMove={() => setIsMoveOpen(true)}
        onSuccess={() => {
          if (onNavigateUnit) {
            onNavigateUnit("");
          } else {
            router.push("/app/administration/master-data/organization");
          }
        }}
      />
    </div>
  );`;

const newContent = content.substring(0, returnStartIdx) + replacement + "\n}\n";
fs.writeFileSync(path, newContent);
console.log('Successfully updated OrgUnitDetailView.tsx properly');
