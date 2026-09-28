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
    <div className={cn("flex flex-col h-full bg-[#f5f5f7] dark:bg-black", className)}>
      {/* ── HEADER ── */}
      <div className="bg-background shrink-0 rounded-t-xl overflow-hidden">
        <div className="px-6 sm:px-8 pt-8 pb-4">
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-start gap-4 min-w-0">
              <div className="size-16 rounded-2xl bg-[#0a2540] text-blue-400 flex items-center justify-center shrink-0 shadow-sm border border-black/10 dark:border-white/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-b from-white/10 to-transparent pointer-events-none" />
                <OrgTypeIcon type={typeCode || "DEPARTMENT"} size="detail" className="size-8" />
              </div>
              <div className="space-y-1 min-w-0 pt-0.5">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-semibold tracking-tight text-foreground truncate">
                    {unit.name}
                  </h1>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 select-none">
                    {unit.code}
                  </span>
                </div>
                
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400 flex flex-col gap-0.5 pt-0.5">
                  {unit.nameAr && (
                    <p dir="rtl" lang="ar" className="font-arabic truncate">
                      {unit.nameAr}
                    </p>
                  )}
                  {breadcrumbItems.length > 0 ? (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {breadcrumbItems.map((item, idx) => (
                        <React.Fragment key={item.orgUnitId || idx}>
                          {idx > 0 && <span>/</span>}
                          <button
                            type="button"
                            onClick={() => item.orgUnitId && onNavigateUnit?.(item.orgUnitId)}
                            className="hover:text-foreground transition-colors truncate max-w-[120px] sm:max-w-[200px]"
                          >
                            {item.name}
                          </button>
                        </React.Fragment>
                      ))}
                    </div>
                  ) : (
                    <span className="text-foreground">Dubai Integrated Economic Zones</span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0 pt-1">
              {can(ORG_PERMISSIONS.UPDATE) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditOpen(true)}
                  className="h-9 rounded-full px-4 gap-2 text-[13px] font-semibold shadow-xs border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
                >
                  <Edit2 className="size-3.5" />
                  Edit
                </Button>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="size-9 rounded-full p-0 shadow-xs border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 p-1 rounded-xl">
                  {can(ORG_PERMISSIONS.MOVE) && (
                    <DropdownMenuItem
                      onClick={() => setIsMoveOpen(true)}
                      className="gap-2 text-[13px] font-medium cursor-pointer rounded-lg py-2"
                    >
                      <ArrowRightLeft className="size-4 text-blue-600" />
                      <span>Move {typeName.toLowerCase()}</span>
                    </DropdownMenuItem>
                  )}
                  {can(ORG_PERMISSIONS.UPDATE) && (
                    <DropdownMenuItem
                      onClick={() => setIsArchiveOpen(true)}
                      className="gap-2 text-[13px] font-medium cursor-pointer rounded-lg py-2"
                    >
                      <Archive className="size-4 text-amber-600" />
                      <span>{unit.isActive ? \`Archive \${typeName.toLowerCase()}\` : \`Restore \${typeName.toLowerCase()}\`}</span>
                    </DropdownMenuItem>
                  )}
                  {can(ORG_PERMISSIONS.DELETE) && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setIsDeleteOpen(true)}
                        className="gap-2 text-[13px] font-medium text-destructive focus:text-destructive cursor-pointer rounded-lg py-2"
                      >
                        <Trash2 className="size-4" />
                        <span>Remove {typeName.toLowerCase()}</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* ── SEGMENTED CONTROL TABS ── */}
        <div className="px-6 sm:px-8 pb-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="h-10 p-1 bg-transparent flex justify-start gap-1">
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
                    className={cn(
                      "h-8 px-4 rounded-full text-[13px] font-semibold transition-all duration-200",
                      activeTab === tab 
                        ? "bg-white text-foreground shadow-sm dark:bg-slate-800" 
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                    )}
                  >
                    {labels[tab]}
                    {counts[tab] ? (
                      <Badge variant="secondary" className="ml-2 text-[10px] font-bold px-1.5 py-0 h-[18px] bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 border-none">
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
                 <div className="p-6 rounded-3xl bg-card border border-border/40 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] space-y-4">
                    <h3 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">
                      Properties
                    </h3>
                    <div className="space-y-1">
                       <div className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                         <span className="text-[13px] text-slate-500">Status</span>
                         <Badge variant="outline" className={cn("text-[11px] font-semibold px-2.5 py-0.5 rounded-full border-none", unit.isActive ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-slate-100 text-slate-600")}>
                            {unit.isActive ? "Active" : "Archived"}
                         </Badge>
                       </div>
                       <div className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                         <span className="text-[13px] text-slate-500">Cost Centre</span>
                         <span className="text-[13px] font-medium text-foreground">{unit.costCenterCode || "None"}</span>
                       </div>
                       <div className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                         <span className="text-[13px] text-slate-500">Sub-units</span>
                         <span className="text-[13px] font-medium text-foreground">{countSentence}</span>
                       </div>
                    </div>
                 </div>

                 {/* Leadership */}
                 <div className="p-6 rounded-3xl bg-card border border-border/40 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">
                        Leadership
                      </h3>
                      {can(ORG_PERMISSIONS.MANAGE_MANAGERS) && !isHeadAssigned && (
                        <button type="button" onClick={() => setActiveTab("people")} className="text-[13px] font-medium text-blue-600 hover:underline">
                          Assign
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-4 pt-1">
                       <div className="size-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-600 dark:text-slate-300 font-medium text-[15px]">
                         {isHeadAssigned ? getInitials(headName) : <User className="size-5 opacity-50" />}
                       </div>
                       <div className="min-w-0">
                         <p className="text-[15px] font-medium text-foreground truncate">{isHeadAssigned ? headName : "Unassigned"}</p>
                         <p className="text-[13px] text-slate-500 mt-0.5 truncate">{isHeadAssigned ? \`Head · Since \${formatDisplayDate(effectiveHeadSince)}\` : "No active leader"}</p>
                       </div>
                    </div>
                 </div>

                 {/* Budget */}
                 <div className="p-6 rounded-3xl bg-card border border-border/40 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] space-y-4">
                    <h3 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">
                      Budget Owner
                    </h3>
                    <div className="pt-1">
                      {isLoadingBudget ? (
                        <div className="flex items-center gap-2 text-[13px] text-slate-500">
                          <Loader2 className="size-4 animate-spin" />
                          <span>Checking...</span>
                        </div>
                      ) : budgetOwner ? (
                        <div>
                          <p className="text-[15px] font-medium text-foreground">{budgetOwner.name}</p>
                          <p className="text-[13px] text-slate-500 mt-0.5">{budgetOwner.code}</p>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <p className="text-[13px] text-slate-500">Not assigned</p>
                          {can(ORG_PERMISSIONS.UPDATE) && (
                            <button type="button" onClick={() => setIsEditOpen(true)} className="text-[13px] font-medium text-blue-600 hover:underline block">
                              Set budget owner
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                 </div>

                 {/* Signoff Chain */}
                 <div className="p-6 rounded-3xl bg-card border border-border/40 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] space-y-4">
                    <h3 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">
                      Approval Route
                    </h3>
                    <div className="pt-1">
                      {isLoadingChain ? (
                        <div className="flex items-center gap-2 text-[13px] text-slate-500">
                          <Loader2 className="size-4 animate-spin" />
                          <span>Loading path...</span>
                        </div>
                      ) : approvalChain && approvalChain.length > 0 ? (
                        <div className="relative pl-1">
                          {approvalChain.map((node, idx) => {
                            const isLast = idx === approvalChain.length - 1;
                            const headPerson = node.head?.displayName;
                            const hasHead = Boolean(headPerson && headPerson !== "Assigned Head");

                            return (
                              <div key={node.orgUnitId || idx} className="relative flex items-start gap-4 pb-6 last:pb-0">
                                {!isLast && (
                                  <div className="absolute left-[7px] top-[22px] bottom-0 w-[2px] bg-slate-100 dark:bg-slate-800" />
                                )}
                                <div className="relative z-10 size-4 rounded-full bg-background border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 mt-1">
                                  <div className={cn("size-1.5 rounded-full", hasHead ? "bg-slate-400 dark:bg-slate-500" : "bg-transparent")} />
                                </div>
                                <div className="min-w-0 flex-1 -mt-0.5">
                                  <p className="text-[14px] font-medium text-foreground leading-snug truncate">
                                    {node.name}
                                  </p>
                                  <p className="text-[13px] text-slate-500 mt-0.5 leading-snug truncate">
                                    {hasHead ? headPerson : "No one in charge"}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-[13px] text-slate-500">No sign-off route required.</p>
                      )}
                    </div>
                 </div>

              </div>
           </TabsContent>

           {/* CHILDREN */}
           <TabsContent value="children" className="m-0 focus-visible:outline-none h-full">
             <div className="rounded-3xl border border-border/40 bg-card shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col h-full min-h-[400px]">
               <div className="p-6 pb-4 flex items-center justify-between gap-4">
                 <div>
                   <h3 className="text-base font-semibold text-foreground">{childMeta.tabLabel}</h3>
                   <p className="text-[13px] text-slate-500 mt-0.5">
                     Teams and divisions inside {unit.name}.
                   </p>
                 </div>
                 {can(ORG_PERMISSIONS.CREATE) && (
                   <Button size="sm" onClick={() => setIsAddChildOpen(true)} className="gap-2 text-[13px] font-medium rounded-full bg-[#1c2c4b] hover:bg-[#15213a] text-white">
                     <Plus className="size-4" />
                     Add {childMeta.singularLabel}
                   </Button>
                 )}
               </div>
               <div className="p-0 flex-1 [&_.border-b]:border-slate-100 dark:[&_.border-b]:border-slate-800/50">
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
             <div className="rounded-3xl border border-border/40 bg-card shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
               <ManagerAssignmentPanel orgUnitId={unit.orgUnitId} unitName={unit.name} />
             </div>
           </TabsContent>

           {/* HISTORY */}
           <TabsContent value="history" className="m-0 focus-visible:outline-none">
             <div className="rounded-3xl border border-border/40 bg-card shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
               <div className="p-6 border-b border-slate-100 dark:border-slate-800/50">
                 <h3 className="text-base font-semibold text-foreground">Change Log</h3>
                 <p className="text-[13px] text-slate-500 mt-0.5">
                   Plain-language record of reporting changes, appointments, and structure updates.
                 </p>
               </div>
               <div className="p-6">
                 {isLoadingLogs ? (
                   <div className="py-8 text-center flex flex-col items-center justify-center space-y-2 text-[13px] text-slate-500">
                     <Loader2 className="size-5 animate-spin text-slate-400" />
                     <span>Loading history records...</span>
                   </div>
                 ) : changeLogsData?.data && changeLogsData.data.length > 0 ? (
                   <div className="space-y-5 divide-y divide-slate-100 dark:divide-slate-800/50">
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
                         <div key={log.changeLogId} className="pt-5 first:pt-0 flex flex-col gap-1.5">
                           <div className="flex items-center justify-between gap-3">
                             <p className="text-[14px] font-medium text-foreground leading-snug">
                               {sentence}
                             </p>
                             <Badge variant="secondary" className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-none shadow-none">
                               {friendlyTag}
                             </Badge>
                           </div>
                           {isMove && log.affectedNodeCount !== undefined && log.affectedNodeCount > 0 && (
                             <p className="text-[13px] text-slate-500">
                               {log.affectedNodeCount} teams inside moved with it.
                             </p>
                           )}
                           {log.reason && (
                             <p className="text-[13px] text-slate-500">
                               Reason: {log.reason}
                             </p>
                           )}
                         </div>
                       );
                     })}
                   </div>
                 ) : (
                   <div className="py-8 text-center text-[13px] text-slate-500">
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-3xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Edit {typeName}</DialogTitle>
            <DialogDescription className="text-sm">
              Update properties for <span className="font-medium text-foreground">{unit.name}</span>.
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-3xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Add {childMeta.singularLabel}</DialogTitle>
            <DialogDescription className="text-sm">
              Add a new {childMeta.singularLabel.toLowerCase()} under{" "}
              <span className="font-medium text-foreground">{unit.name}</span>.
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
